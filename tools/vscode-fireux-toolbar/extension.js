const vscode = require('vscode')

function activate(context) {
  const ws =
    vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders[0]
  const cwd = ws ? ws.uri.fsPath : undefined

  const ensureTerminal = (name, command) => {
    const existing = vscode.window.terminals.find((t) => t.name === name)
    if (existing) {
      existing.show()
      return existing
    }
    const term = vscode.window.createTerminal({ name, cwd })
    term.show()
    term.sendText(command)
    return term
  }

  const runTaskIfPresent = async (label) => {
    try {
      const tasks = await vscode.tasks.fetchTasks()
      const hasTask = tasks.some((t) => t.name === label)
      if (!hasTask) return false

      await vscode.commands.executeCommand('workbench.action.tasks.runTask', label)
      return true
    } catch {
      return false
    }
  }

  const isTaskRunning = (label) => {
    return vscode.tasks.taskExecutions.some((e) => e.task?.name === label)
  }

  const openAppUrl = async (url) => {
    try {
      await vscode.env.openExternal(vscode.Uri.parse(url))
    } catch {
      // noop
    }
  }

  const register = (commandId, runner) => {
    const d = vscode.commands.registerCommand(commandId, runner)
    context.subscriptions.push(d)
  }

  const apps = [
    {
      key: 'fireux',
      name: 'FireUX',
      icon: '$(flame)',
      commandId: 'fireuxToolbar.startFireux',
      taskLabel: 'dev:fireux (3000)',
      terminalName: 'FireUX (3000)',
      pnpmCommand: 'pnpm dev:fireux',
      tooltip: 'Start FireUX dev (port 3000)',
      url: 'http://localhost:3000',
      priority: 100,
    },
    {
      key: 'misebox',
      name: 'MiseBox',
      icon: '$(book)',
      commandId: 'fireuxToolbar.startMisebox',
      taskLabel: 'dev:misebox (3001)',
      terminalName: 'MiseBox (3001)',
      pnpmCommand: 'pnpm dev:misebox',
      tooltip: 'Start MiseBox dev (port 3001)',
      url: 'http://localhost:3001',
      priority: 99,
    },
    {
      key: 'cleanbox',
      name: 'CleanBox',
      icon: '$(beaker)',
      commandId: 'fireuxToolbar.startCleanbox',
      taskLabel: 'dev:cleanbox (3002)',
      terminalName: 'CleanBox (3002)',
      pnpmCommand: 'pnpm dev:cleanbox',
      tooltip: 'Start CleanBox dev (port 3002)',
      url: 'http://localhost:3002',
      priority: 98,
    },
    {
      key: 'niederhorn',
      name: 'Niederhorn',
      icon: '$(mountain)',
      commandId: 'fireuxToolbar.startNiederhorn',
      taskLabel: 'dev:niederhorn (3003)',
      terminalName: 'Niederhorn (3003)',
      pnpmCommand: 'pnpm dev:niederhorn',
      tooltip: 'Start Niederhorn dev (port 3003)',
      url: 'http://localhost:3003',
      priority: 97,
    },
    {
      key: 'richies',
      name: 'Richies',
      icon: '$(tools)',
      commandId: 'fireuxToolbar.startRichies',
      taskLabel: 'dev:richies (3004)',
      terminalName: 'Richies (3004)',
      pnpmCommand: 'pnpm dev:richies',
      tooltip: 'Start Richies dev (port 3004)',
      url: 'http://localhost:3004',
      priority: 96,
    },
    {
      key: 'tennant',
      name: 'Tennant',
      icon: '$(home)',
      commandId: 'fireuxToolbar.startTennant',
      taskLabel: 'dev:tennant (3005)',
      terminalName: 'Tennant (3005)',
      pnpmCommand: 'pnpm dev:tennant',
      tooltip: 'Start Tennant dev (port 3005)',
      url: 'http://localhost:3005',
      priority: 95,
    },
  ]

  for (const app of apps) {
    register(app.commandId, async () => {
      // If the VS Code task is already running, don't start another.
      if (isTaskRunning(app.taskLabel)) {
        await openAppUrl(app.url)
        return
      }

      const ranTask = await runTaskIfPresent(app.taskLabel)
      if (ranTask) {
        await openAppUrl(app.url)
        return
      }

      // Fallback: dedicated terminal per app (never reuse another app's terminal).
      const existingTerminal = vscode.window.terminals.find(
        (t) => t.name === app.terminalName
      )
      if (existingTerminal) {
        existingTerminal.show()
        await openAppUrl(app.url)
        return
      }

      ensureTerminal(app.terminalName, app.pnpmCommand)
      await openAppUrl(app.url)
    })
  }

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
  for (const app of apps) {
    makeBtn(
      `${app.icon} ${app.name}`,
      app.tooltip,
      app.commandId,
      app.priority
    )
  }
}

function deactivate() {}

module.exports = { activate, deactivate }
