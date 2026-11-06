import re

with open("packages/400.conductor/35.remotion.unit/buz/stampComposition.buzz.ts", "r") as f:
    content = f.read()

# Fix stampStaticComposition to actually include the ambient track when audioOnly=true
pattern = r"(const sequenceNodes = options\.audioOnly \? `\$\{dialogueNodes\}\\n\\n\$\{foleyNodes\}` : shots\s*\.map\(\(s, idx\) => generateOpticalStackJsx\(idx \+ 1, s\)\)\s*\.join\('\\n\\n'\))"
replacement = r"""const ambientTrack = `          {/* Track 3: Ambient Bed with Automatic Speech Ducking (-14.0 dB) */}\n          <Audio\n            src={staticFile('${ambientPath}')}\n            volume={${duckExpression}}\n          />`;

    const sequenceNodes = options.audioOnly ? `${ambientTrack}\n\n${dialogueNodes}\n\n${foleyNodes}` : shots
        .map((s, idx) => generateOpticalStackJsx(idx + 1, s))
        .join('\\n\\n')"""

content = re.sub(pattern, replacement, content)

# Remove the default Track 3 that is always injected in the template
pattern_template = r"(\{\/\* Track 3: Ambient Bed with Automatic Speech Ducking \(-14\.0 dB\) \*\/\}\\n\s+<Audio\\n\s+src=\{staticFile\('\$\{ambientPath\}'\)\}\\n\s+volume=\{\$\{duckExpression\}\}\\n\s+\/>\\n\\n)"
content = re.sub(pattern_template, "", content)

# And now we only output sequenceNodes in the body because we already included ambientTrack in it for audioOnly,
# but for non-audioOnly we should ALSO include ambientTrack since I removed it from the template!

# Wait, let's just make it simpler:

# Restore the original file and fix properly
