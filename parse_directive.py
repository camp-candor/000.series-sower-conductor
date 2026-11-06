import re

with open('/tmp/full_directive.txt', 'r') as f:
    text = f.read()

# We want to extract files to write.
# Format in markdown is:
# ```typescript
# // packages/400.conductor/98.menu.unit/fce/menu.interface.ts
# ...
# ```

code_blocks = re.findall(r'```typescript\n// ([^\n]+)\n(.*?)```', text, re.DOTALL)
for filepath, content in code_blocks:
    filepath = filepath.strip()
    if filepath.startswith('In '):
        continue
    print(f"File: {filepath}")
