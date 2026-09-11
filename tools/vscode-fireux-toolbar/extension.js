const vscode = require('vscode')
const fs = require('node:fs')
const { apps } = require('./apps')
const { registerFileTreeCommands } = require('./file-tree-commands')
const {
  findRepoRoot,
  safeOrigin,
  tryReuseTabMacOS,
} = require('./toolbar-utils')

function activate(context) {
  const workspaceFolders = vscode.workspace.workspaceFolders ?? []
  const workspaceCwd = workspaceFolders
    .map((folder) => findRepoRoot(folder.uri.fsPath))
    .find(Boolean)
  const fallbackRepoCwd = findRepoRoot(__dirname)
  const cwd =
    (workspaceCwd && fs.existsSync(workspaceCwd) && workspaceCwd) ||
    (fallbackRepoCwd && fs.existsSync(fallbackRepoCwd) && fallbackRepoCwd) ||
    undefined

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

  const ensureNamedTerminal = (name, { cwd } = {}) => {
    const existing = vscode.window.terminals.find((t) => t.name === name)
    if (existing) {
      existing.show()
      return existing
    }
    const term = vscode.window.createTerminal({ name, cwd })
    term.show()
    return term
  }

  const runTaskIfPresent = async (label) => {
    // Tasks here rely on `${workspaceFolder}`. Skip task launching when that folder is stale.
    if (!workspaceCwd || !fs.existsSync(workspaceCwd)) return false

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
    if (!url) return
    const cfg = vscode.workspace.getConfiguration('fireuxToolbar')
    const reuse = cfg.get('reuseBrowserTab', true)
    const browser = cfg.get('reuseBrowser', 'chrome')
    const matchMode = cfg.get('reuseMatch', 'origin')

    if (reuse && process.platform === 'darwin') {
      const matchPrefix =
        matchMode === 'origin' ? safeOrigin(url) : String(url || '').trim()
      const ok = await tryReuseTabMacOS({
        browser,
        matchPrefix,
        targetUrl: url,
      })
      if (ok) return
    }

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

  registerFileTreeCommands({ register, cwd, ensureNamedTerminal })

  register('fireuxToolbar.gitSave', async () => {
    const ranTask = await runTaskIfPresent('Git Save')
    if (!ranTask) {
      const terminal = ensureNamedTerminal('Git Save', { cwd })
      terminal.sendText('pnpm gitsave')
    }
  })

  const appByKey = new Map(apps.map((app) => [app.key, app]))

  const isTerminalRunning = (terminalName) => {
    const term = vscode.window.terminals.find((t) => t.name === terminalName)
    return !!term && !term.exitStatus
  }

  const isAppRunning = (app) => {
    return isTaskRunning(app.taskLabel) || isTerminalRunning(app.terminalName)
  }

  const startApp = async (app, { openUrl = true } = {}) => {
    if (!app) return

    // If the VS Code task is already running, don't start another.
    if (isTaskRunning(app.taskLabel)) {
      if (openUrl) await openAppUrl(app.url)
      return
    }

    const ranTask = await runTaskIfPresent(app.taskLabel)
    if (ranTask) {
      if (openUrl) await openAppUrl(app.url)
      return
    }

    // Fallback: dedicated terminal per app (never reuse another app's terminal).
    const existingTerminal = vscode.window.terminals.find(
      (t) => t.name === app.terminalName
    )
    if (existingTerminal) {
      existingTerminal.show()
      if (openUrl) await openAppUrl(app.url)
      return
    }

    ensureTerminal(app.terminalName, app.pnpmCommand)
    if (openUrl) await openAppUrl(app.url)
  }

  const killApp = async (app) => {
    if (!app) return

    const taskLabel = `pnpm kill:${app.key}`
    const ranTask = await runTaskIfPresent(taskLabel)
    if (ranTask) return

    const terminal = ensureNamedTerminal(`Kill ${app.name} (${app.port})`, { cwd })
    terminal.sendText(`pnpm kill:${app.key}`)
  }

  const resolveAppFromArg = (arg) => {
    if (typeof arg === 'string') return appByKey.get(arg)
    if (arg && typeof arg === 'object' && typeof arg.key === 'string') {
      return appByKey.get(arg.key)
    }
    return undefined
  }

  const serverTreeChanged = new vscode.EventEmitter()
  context.subscriptions.push(serverTreeChanged)

  const refreshServersView = () => {
    serverTreeChanged.fire(undefined)
  }

  const getServerTreeItem = (app) => {
      const running = isAppRunning(app)
      const item = new vscode.TreeItem(
        `${app.name} (${app.port})`,
        vscode.TreeItemCollapsibleState.None
      )
      item.id = `fireuxToolbar.${app.key}`
      item.contextValue = 'fireuxServer'
      item.description = running ? 'running' : 'stopped'
      item.tooltip = `${app.name}\n${app.url}\n${running ? 'Running' : 'Stopped'}`
      item.iconPath = running
        ? new vscode.ThemeIcon(
          'circle-filled',
          new vscode.ThemeColor('testing.iconPassed')
        )
        : new vscode.ThemeIcon('circle-large-outline')
      item.command = {
        command: 'fireuxToolbar.startAppByKey',
        title: `Start ${app.name}`,
        arguments: [app.key],
      }
      return item
  }

  const ecosystemViewIds = {
    fireux: 'fireuxToolbar.fireuxServersView',
    buenohost: 'fireuxToolbar.buenohostServersView',
    misebox: 'fireuxToolbar.miseboxServersView',
    werkbox: 'fireuxToolbar.werkboxServersView',
    bringli: 'fireuxToolbar.bringliServersView',
    granite: 'fireuxToolbar.graniteServersView',
    slap: 'fireuxToolbar.slapServersView',
  }

  const ecosystemTreeViews = new Map()
  for (const [ecosystem, viewId] of Object.entries(ecosystemViewIds)) {
    const ecosystemApps = apps.filter((app) => app.ecosystem === ecosystem)
    const treeDataProvider = {
      onDidChangeTreeData: serverTreeChanged.event,
      getTreeItem: getServerTreeItem,
      getChildren: () => ecosystemApps,
    }
    const treeView = vscode.window.createTreeView(viewId, {
      treeDataProvider,
      showCollapseAll: false,
    })
    ecosystemTreeViews.set(ecosystem, { apps: ecosystemApps, treeView })
    context.subscriptions.push(treeView)
  }

  register('fireuxToolbar.openServersView', async () => {
    await vscode.commands.executeCommand(
      'workbench.view.extension.fireux-misebox'
    )
    const miseboxView = ecosystemTreeViews.get('misebox')
    try {
      if (miseboxView?.apps.length > 0) {
        await miseboxView.treeView.reveal(miseboxView.apps[0], {
          focus: true,
          select: false,
          expand: false,
        })
      }
    } catch {
      // noop
    }
  })

  register('fireuxToolbar.refreshServers', async () => {
    refreshServersView()
  })

  register('fireuxToolbar.startAllServers', async () => {
    for (const app of apps) {
      await startApp(app, { openUrl: false })
    }
    refreshServersView()
  })

  register('fireuxToolbar.startAppByKey', async (arg) => {
    const app = resolveAppFromArg(arg)
    if (!app) return
    await startApp(app, { openUrl: true })
    refreshServersView()
  })

  register('fireuxToolbar.openAppByKey', async (arg) => {
    const app = resolveAppFromArg(arg)
    if (!app) return
    await openAppUrl(app.url)
  })

  register('fireuxToolbar.killAppByKey', async (arg) => {
    const app = resolveAppFromArg(arg)
    if (!app) return
    await killApp(app)
    refreshServersView()
  })

  for (const app of apps) {
    register(app.commandId, async () => {
      await startApp(app, { openUrl: true })
      refreshServersView()
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

  // Keep top two apps pinned in the status bar.
  makeBtn(
    '$(flame) FireUX',
    'Start FireUX dev (port 3000)',
    'fireuxToolbar.startFireux',
    102
  )
  makeBtn(
    '$(book) MiseBox',
    'Start MiseBox dev (port 3001)',
    'fireuxToolbar.startMisebox',
    101
  )

  // Quick Git save button.
  makeBtn(
    '$(cloud-upload) Git Save',
    'Run pnpm gitsave',
    'fireuxToolbar.gitSave',
    100
  )

  // Single Git button (preview contents of files waiting to be confirmed)
  makeBtn(
    '$(git-commit) Git Q',
    'Show files waiting to be confirmed',
    'fireuxToolbar.gitQPreview',
    99
  )

  context.subscriptions.push(
    vscode.tasks.onDidStartTask(refreshServersView),
    vscode.tasks.onDidEndTask(refreshServersView),
    vscode.tasks.onDidEndTaskProcess(refreshServersView),
    vscode.window.onDidOpenTerminal(refreshServersView),
    vscode.window.onDidCloseTerminal(refreshServersView)
  )

  refreshServersView()
}

function deactivate() {}

module.exports = { activate, deactivate }
