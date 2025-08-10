# FireUX Toolbar (VS Code Extension)

Adds quick-access buttons in multiple places:

- Command Center (top toolbar): Start FireUX (flame), MiseBox (book), CleanBox (beaker)
- Editor Title Bar: the same three commands as icons
- Status Bar (left): optional buttons remain for redundancy
- Keyboard: Cmd+Alt+F (FireUX), Cmd+Alt+M (MiseBox), Cmd+Alt+C (CleanBox) on macOS

## How to run (dev)

1. In VS Code, open this repository root.
2. Open the Run & Debug panel and select "Run FireUX Toolbar Extension".
3. Press Run. An Extension Development Host window opens.
4. Top toolbar (Command Center): the three buttons appear. If hidden, enable via Settings → "Command Center".
5. Editor title bar also shows the three icons when a file is open. Status bar has the legacy buttons on the left.

## How to install permanently

Option A (quick): Use the debug configuration above whenever needed.

Option B (package):

- Install `vsce` globally (`npm i -g @vscode/vsce`), run `vsce package` in this folder, then in VS Code use "Extensions: Install from VSIX" to install the generated .vsix.

Tip: If you don’t see the top toolbar, enable Settings → Window: Command Center.
