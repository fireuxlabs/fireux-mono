# FireUX Toolbar (VS Code Extension)

Adds three status bar buttons:

- $(flame) 3000 FireUX → runs `pnpm dev:fireux`
- $(book) 3001 MiseBox → runs `pnpm dev:misebox`
- $(beaker) 3002 CleanBox → runs `pnpm dev:cleanbox`

## How to run (dev)

1. In VS Code, open this repository root.
2. Open the Run & Debug panel and select "Run FireUX Toolbar Extension".
3. Press Run. An Extension Development Host window opens.
4. The three buttons appear on the left of the status bar.

## How to install permanently

Option A (quick): Use the debug configuration above whenever needed.

Option B (package):
- Install `vsce` globally (`npm i -g @vscode/vsce`), run `vsce package` in this folder, then in VS Code use "Extensions: Install from VSIX" to install the generated .vsix.

