import path from 'node:path'
import { repoRoot, runCommands, testFiles } from './check.mjs'

// Bounded, offline suite. Domain suites remain available through test:scope.
const core = 'packages/core/fireux-core/src/test'
process.exitCode = runCommands([
  {
    command: process.execPath,
    args: [
      '--test',
      ...testFiles(path.join(repoRoot, 'tools/ide')),
      ...['admin-credentials', 'editable-string-field', 'meta-content'].map(
        (name) => path.join(repoRoot, core, `${name}.test.mjs`)
      ),
    ],
    cwd: repoRoot,
  },
])
