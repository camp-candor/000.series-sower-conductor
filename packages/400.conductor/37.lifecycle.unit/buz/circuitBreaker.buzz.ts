import {
  MasterSceneLifecycleContext,
  CircuitBreakerResult,
} from '../fce/masterLifecycle.interface.js';

export function evaluateFailureEscalation(
  ctx: MasterSceneLifecycleContext,
  error: Error
): CircuitBreakerResult {
  ctx.attemptCount++;
  ctx.lastError = error.message;

  if (ctx.attemptCount >= ctx.maxAttempts) {
    ctx.currentStage = 'STAGE_FAILED_DLQ';
    const logMsg = `>> [CIRCUIT-BREAKER] [TRIPPED] Attempt ${ctx.attemptCount}/${ctx.maxAttempts} failed. Quarantining scene ${ctx.sceneId} to STAGE_FAILED_DLQ: ${error.message}`;
    ctx.telemetryLogs.push(logMsg);
    process.stderr.write(`${logMsg}\n`);

    return {
      quarantined: true,
      action: 'DEAD_LETTER_QUARANTINE',
      currentAttempt: ctx.attemptCount,
      maxAttempts: ctx.maxAttempts,
      error: error.message,
    };
  }

  const logMsg = `>> [CIRCUIT-BREAKER] [RETRY] Strike ${ctx.attemptCount}/${ctx.maxAttempts} for ${ctx.sceneId}. Scheduling retry: ${error.message}`;
  ctx.telemetryLogs.push(logMsg);
  process.stdout.write(`${logMsg}\n`);

  return {
    quarantined: false,
    action: 'RETRY',
    currentAttempt: ctx.attemptCount,
    maxAttempts: ctx.maxAttempts,
    error: error.message,
  };
}
