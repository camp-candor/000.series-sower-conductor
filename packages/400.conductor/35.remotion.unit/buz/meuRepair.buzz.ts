import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import {
  EjectMarkerStatus,
  MeuRemediationTicket,
  StoryArchitectDossier,
} from '../fce/remotion.interface.js';

export function inspectEjectLockHeader(filePath: string): EjectMarkerStatus {
  if (!fs.existsSync(filePath)) {
    return { isLocked: false, filePath };
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n').slice(0, 10);
  const lockLine = lines.find((l) => l.includes('@showrunner-lock: locked'));

  if (lockLine) {
    return {
      isLocked: true,
      filePath,
      lockAuthor: 'SHOWRUNNER_OVERRIDE',
    };
  }

  return { isLocked: false, filePath };
}

export function assertShowrunnerUnlock(filePath: string): void {
  const status = inspectEjectLockHeader(filePath);
  if (status.isLocked) {
    throw new Error(`EJECT_BUTTON_LOCKED: File ${path.basename(filePath)} is locked by showrunner override.`);
  }
}

export function applyShowrunnerLock(filePath: string, author = 'SHOWRUNNER_DIRECTOR'): void {
  if (!fs.existsSync(filePath)) {
    throw new Error(`FILE_NOT_FOUND: Cannot lock non-existent file ${filePath}`);
  }

  const content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('@showrunner-lock: locked')) return;

  const header = `// @showrunner-lock: locked\n// @locked-by: ${author}\n// @timestamp: ${new Date().toISOString()}\n`;
  const lockedContent = header + content;

  const tmpPath = `${filePath}.tmp`;
  fs.writeFileSync(tmpPath, lockedContent, 'utf8');
  fs.renameSync(tmpPath, filePath);
}

export function evaluateMeuCircuitBreaker(ticket: MeuRemediationTicket): StoryArchitectDossier | null {
  if (ticket.cycleCount >= 3) {
    const dossier: StoryArchitectDossier = {
      dossierId: `dossier_${ticket.ticketId}_${Date.now()}`,
      ticketId: ticket.ticketId,
      targetFile: ticket.targetFile,
      componentName: ticket.componentName,
      failedAttempts: ticket.cycleCount,
      escalatedAtMs: Date.now(),
      reason: `CIRCUIT_BREAKER_TRIPPED: Automated MEU repair failed to converge after ${ticket.cycleCount} attempts.`,
      status: 'TIER_3_QUARANTINED',
    };

    const quarantineDir = path.resolve(process.cwd(), process.cwd().endsWith('400.conductor') ? '' : 'packages/400.conductor', 'vault/quarantine');
    if (!fs.existsSync(quarantineDir)) {
      fs.mkdirSync(quarantineDir, { recursive: true });
    }

    const dossierPath = path.join(quarantineDir, `${dossier.dossierId}.json`);
    fs.writeFileSync(dossierPath, JSON.stringify(dossier, null, 2), 'utf8');

    return dossier;
  }

  return null;
}

export function executeSurgicalMeuAstMutation(ticket: MeuRemediationTicket): {
  success: boolean;
  mutatedPath: string;
  patchReceipt: string;
} {
  assertShowrunnerUnlock(ticket.targetFile);

  const dossier = evaluateMeuCircuitBreaker(ticket);
  if (dossier) {
    throw new Error(`CIRCUIT_BREAKER_TRIPPED: Escalated to Story Architect quarantine (${dossier.dossierId})`);
  }

  const sourceCode = fs.readFileSync(ticket.targetFile, 'utf8');
  const sourceFile = ts.createSourceFile(
    ticket.targetFile,
    sourceCode,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );

  let targetFound = false;

  const transformer = <T extends ts.Node>(context: ts.TransformationContext) => {
    return (rootNode: T) => {
      function visit(node: ts.Node): ts.Node {
        // Look for JSX Opening or Self-Closing Elements
        if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
          const tagName = node.tagName.getText(sourceFile);
          if (tagName === ticket.componentName || tagName.endsWith(ticket.componentName)) {
            const updatedAttributes = node.attributes.properties.map((prop) => {
              if (ts.isJsxAttribute(prop) && prop.name.getText(sourceFile) === ticket.propName) {
                targetFound = true;
                const newInitializer =
                  typeof ticket.newValue === 'number'
                    ? ts.factory.createJsxExpression(
                        undefined,
                        ts.factory.createNumericLiteral(ticket.newValue.toString())
                      )
                    : ts.factory.createStringLiteral(ticket.newValue.toString());

                return ts.factory.updateJsxAttribute(prop, prop.name, newInitializer);
              }
              return prop;
            });

            const newAttributes = ts.factory.updateJsxAttributes(node.attributes, updatedAttributes);

            if (ts.isJsxOpeningElement(node)) {
              return ts.factory.updateJsxOpeningElement(node, node.tagName, node.typeArguments, newAttributes);
            }
            return ts.factory.updateJsxSelfClosingElement(node, node.tagName, node.typeArguments, newAttributes);
          }
        }
        return ts.visitEachChild(node, visit, context);
      }
      return ts.visitNode(rootNode, visit);
    };
  };

  const transformationResult = ts.transform(sourceFile, [transformer]);
  const transformedSourceFile = transformationResult.transformed[0] as ts.SourceFile;

  if (!targetFound) {
    throw new Error(
      `AST_TARGET_NOT_FOUND: Could not find prop '${ticket.propName}' on component '${ticket.componentName}'`
    );
  }

  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
  let mutatedCode = printer.printFile(transformedSourceFile);

  // Append lifecycle patched tag to header
  if (!mutatedCode.includes('@lifecycle: patched')) {
    mutatedCode = `// @lifecycle: patched [ticket: ${ticket.ticketId}] [cycle: ${ticket.cycleCount}]\n` + mutatedCode;
  }

  const tmpPath = `${ticket.targetFile}.tmp`;
  fs.writeFileSync(tmpPath, mutatedCode, 'utf8');
  fs.renameSync(tmpPath, ticket.targetFile);

  const receipt = `>> [MEU-SURGERY] [OK] Mutated ${ticket.componentName}.${ticket.propName} => ${ticket.newValue} (Ticket: ${ticket.ticketId})\n`;
  process.stdout.write(receipt);

  return {
    success: true,
    mutatedPath: ticket.targetFile,
    patchReceipt: receipt,
  };
}
