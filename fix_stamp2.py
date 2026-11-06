import re

with open("packages/400.conductor/35.remotion.unit/buz/stampComposition.buzz.ts", "r") as f:
    content = f.read()

# Let's fix the template
pattern_template = r"(\{\/\* Track 3: Ambient Bed with Automatic Speech Ducking \(-14\.0 dB\) \*\/\}\n\s+<Audio\n\s+src=\{staticFile\('\$\{ambientPath\}'\)\}\n\s+volume=\{\$\{duckExpression\}\}\n\s+\/>\n\n\$\{sequenceNodes\})"

replacement_template = r"""${options.audioOnly ? '' : `          {/* Track 3: Ambient Bed with Automatic Speech Ducking (-14.0 dB) */}
          <Audio
            src={staticFile('${ambientPath}')}
            volume={${duckExpression}}
          />`}

${sequenceNodes}"""

content = re.sub(pattern_template, replacement_template, content)

# But wait, in audioOnly mode, does the directive specify Track 3 Ambient?
# Let's check directive:
# "Track 3 (Ambient <Audio src={staticFile(...)} volume={(f) => ...} loop />) with unquoted integer frame literals."
# The directive requires ambient track in audio-only mode.
