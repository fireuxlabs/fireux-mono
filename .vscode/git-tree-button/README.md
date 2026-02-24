# Git Tree Button (workspace extension)

This small workspace extension adds a status-bar button labeled "Git Tree" which runs `pnpm git-tree:full` in a terminal when clicked.

How to use

- Quick test in Extension Development Host:

  1. Open this workspace in VS Code.
  2. Open the folder `.vscode/git-tree-button` in the Explorer.
  3. Press F5 (Run Extension) to launch an Extension Development Host window. The status bar in that host will show the button.
  4. Click the button to run `pnpm git-tree:full`.

- Install for regular use (optional):

  1. Install `vsce` (`npm i -g vsce`) and run `vsce package` inside `.vscode/git-tree-button` to produce a `.vsix`.
  2. In VS Code: `Extensions: Install from VSIX...` and pick the generated file.

Notes

- The button executes `pnpm git-tree:full` in a new terminal named `git-tree`.
- If you prefer not to install an extension, you can run the same command from the Command Palette or use the `Git Tree (full)` task from the Tasks menu.
