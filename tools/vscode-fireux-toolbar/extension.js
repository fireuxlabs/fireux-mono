const vscode = require('vscode')

function activate(context) {
  const ws =
    vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders[0]
  const cwd = ws ? ws.uri.fsPath : undefined

  const ensureTerminal = (name, command) => {
    const existing = vscode.window.terminals.find((t) => t.name === name)
    if (existing) {
      existing.show()
      existing.sendText(command)
      return existing
    }
    const term = vscode.window.createTerminal({ name, cwd })
    term.show()
    term.sendText(command)
    return term
  }

  const register = (commandId, runner) => {
    const d = vscode.commands.registerCommand(commandId, runner)
    context.subscriptions.push(d)
  }

  register('fireuxToolbar.startFireux', () =>
    ensureTerminal('FireUX (3000)', 'pnpm dev:fireux')
  )
  register('fireuxToolbar.startMisebox', () =>
    ensureTerminal('MiseBox (3001)', 'pnpm dev:misebox')
  )
  register('fireuxToolbar.startCleanbox', () =>
    ensureTerminal('CleanBox (3002)', 'pnpm dev:cleanbox')
  )

  const makeBtn = (text, tooltip, command, priority) => {
    const item = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left,
      priority
    )
    item.text = text
    item.tooltip = tooltip
    item.command = command
    item.show()
    context.subscriptions.push(item)
  }

  // Status bar buttons
  makeBtn(
    '$(flame) 3000 FireUX',
    'Start FireUX dev (port 3000)',
    'fireuxToolbar.startFireux',
    100
  )
  makeBtn(
    '$(book) 3001 MiseBox',
    'Start MiseBox dev (port 3001)',
    'fireuxToolbar.startMisebox',
    99
  )
  makeBtn(
    '$(beaker) 3002 CleanBox',
    'Start CleanBox dev (port 3002)',
    'fireuxToolbar.startCleanbox',
    98
  )
}

function deactivate() {}

module.exports = { activate, deactivate }
