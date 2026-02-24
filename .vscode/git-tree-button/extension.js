const vscode = require('vscode');

function activate(context) {
  const runCommand = vscode.commands.registerCommand('gitTreeButton.run', () => {
    const terminal = vscode.window.createTerminal({ name: 'git-tree' });
    terminal.show(true);
    terminal.sendText('pnpm git-tree:full');
  });

  const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  statusBarItem.command = 'gitTreeButton.run';
  statusBarItem.text = '$(repo) Git Tree';
  statusBarItem.tooltip = 'Run `pnpm git-tree:full`';
  statusBarItem.show();

  context.subscriptions.push(statusBarItem, runCommand);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
};
