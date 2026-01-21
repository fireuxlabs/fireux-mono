const vscode = require('vscode')
const cp = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')

function execFileAsync(cmd, args, opts = {}) {
  const { maxBuffer, ...execOpts } = opts ?? {}
  return new Promise((resolve, reject) => {
    cp.execFile(
      cmd,
      args,
      { ...execOpts, maxBuffer: maxBuffer ?? 1024 * 1024 },
      (err, stdout, stderr) => {
      if (err) {
        err.stdout = stdout
        err.stderr = stderr
        reject(err)
        return
      }
      resolve({ stdout, stderr })
      }
    )
  })
}

function shellQuotePosix(value) {
  const s = String(value ?? '')
  if (s.length === 0) return "''"
  return `'${s.replaceAll("'", `'\\''`)}'`
}

function cwdForUri(uri) {
  try {
    if (!uri || !uri.fsPath) return undefined
    const fsPath = uri.fsPath
    // Heuristic: if it has an extension, treat as file.
    if (path.extname(fsPath)) return path.dirname(fsPath)
    return fsPath
  } catch {
    return undefined
  }
}

function isProbablyBinary(buffer) {
  if (!buffer || buffer.length === 0) return false
  const limit = Math.min(buffer.length, 8000)
  for (let i = 0; i < limit; i++) {
    if (buffer[i] === 0) return true
  }
  return false
}

function normalizeRelPath(rel) {
  return rel.split(path.sep).join('/')
}

async function collectFilesRecursive(fsApi, rootDir, opts) {
  const ignoreNames = new Set([
    '.git',
    'node_modules',
    'dist',
    '.nuxt',
    '.output',
    '.data',
    '.cache',
    '.nitro',
  ])

  const results = []
  const stack = [rootDir]

  while (stack.length) {
    const dir = stack.pop()
    let entries
    try {
      entries = await fsApi.readDirectory(vscode.Uri.file(dir))
    } catch {
      continue
    }

    for (const [name, type] of entries) {
      if (ignoreNames.has(name)) continue
      if (name === '.DS_Store') continue

      const full = path.join(dir, name)

      if ((type & vscode.FileType.Directory) === vscode.FileType.Directory) {
        stack.push(full)
        continue
      }
      if ((type & vscode.FileType.File) !== vscode.FileType.File) continue

      results.push(full)
      if (results.length >= opts.maxFiles) return results
    }
  }

  return results
}

async function buildCatTreeText(rootDir, { maxFiles, maxFileBytes, maxTotalBytes }) {
  const files = await collectFilesRecursive(vscode.workspace.fs, rootDir, { maxFiles })
  files.sort((a, b) => a.localeCompare(b))

  const decoder = new TextDecoder('utf-8', { fatal: false })
  let total = 0
  const chunks = []

  for (const abs of files) {
    const rel = normalizeRelPath(path.relative(rootDir, abs))
    const header = `\n\n===== ./${rel} =====\n`
    chunks.push(header)
    total += Buffer.byteLength(header, 'utf8')
    if (total > maxTotalBytes) {
      chunks.push('\n[cat-tree truncated: output size exceeded]\n')
      break
    }

    let data
    try {
      data = await vscode.workspace.fs.readFile(vscode.Uri.file(abs))
    } catch {
      chunks.push('[unreadable]\n')
      continue
    }

    if (data.byteLength > maxFileBytes) {
      chunks.push(`[skipped: file too large (${data.byteLength} bytes)]\n`)
      continue
    }

    const buf = Buffer.from(data)
    if (isProbablyBinary(buf)) {
      chunks.push('[skipped: binary file]\n')
      continue
    }

    const text = decoder.decode(buf)
    chunks.push(text)
    total += Buffer.byteLength(text, 'utf8')
    if (total > maxTotalBytes) {
      chunks.push('\n[cat-tree truncated: output size exceeded]\n')
      break
    }
  }

  return chunks.join('')
}

function tryRealpath(absPath) {
  try {
    return fs.realpathSync(absPath)
  } catch {
    return null
  }
}

function formatRealTarget({ workspaceRootDir, realAbsPath }) {
  if (!realAbsPath) return ''
  if (!workspaceRootDir) return normalizeRelPath(realAbsPath)

  const rel = path.relative(workspaceRootDir, realAbsPath)
  if (!rel || rel.startsWith('..') || path.isAbsolute(rel)) {
    return normalizeRelPath(realAbsPath)
  }

  return normalizeRelPath(rel)
}

async function buildMirrorTreeText(
  mirrorDir,
  { workspaceRootDir, maxFiles, maxFileBytes, maxTotalBytes }
) {
  const files = await collectFilesRecursive(vscode.workspace.fs, mirrorDir, { maxFiles })
  const filtered = files.filter((abs) => {
    const base = path.basename(abs)
    if (base === 'README.md') return false
    if (base === 'mirror.txt') return false
    return true
  })
  filtered.sort((a, b) => a.localeCompare(b))

  const decoder = new TextDecoder('utf-8', { fatal: false })
  let total = 0
  const chunks = []

  for (const abs of filtered) {
    const rel = normalizeRelPath(path.relative(mirrorDir, abs))
    const realAbs = tryRealpath(abs)
    const realDisplay = formatRealTarget({ workspaceRootDir, realAbsPath: realAbs })
    const isDifferent = !!(realAbs && path.resolve(realAbs) !== path.resolve(abs))

    const header = `\n\n===== ./${rel}${isDifferent ? ` -> ${realDisplay}` : ''} =====\n`
    chunks.push(header)
    total += Buffer.byteLength(header, 'utf8')
    if (total > maxTotalBytes) {
      chunks.push('\n[mirror-tree truncated: output size exceeded]\n')
      break
    }

    let data
    try {
      data = await vscode.workspace.fs.readFile(vscode.Uri.file(abs))
    } catch {
      chunks.push('[unreadable]\n')
      continue
    }

    if (data.byteLength > maxFileBytes) {
      chunks.push(`[skipped: file too large (${data.byteLength} bytes)]\n`)
      continue
    }

    const buf = Buffer.from(data)
    if (isProbablyBinary(buf)) {
      chunks.push('[skipped: binary file]\n')
      continue
    }

    const text = decoder.decode(buf)
    chunks.push(text)
    total += Buffer.byteLength(text, 'utf8')
    if (total > maxTotalBytes) {
      chunks.push('\n[mirror-tree truncated: output size exceeded]\n')
      break
    }
  }

  return chunks.join('')
}

function safeOrigin(url) {
  try {
    return new URL(url).origin
  } catch {
    return ''
  }
}

async function tryReuseTabMacOS({ browser, matchPrefix, targetUrl }) {
  if (!matchPrefix || !targetUrl) return false

  const appName =
    browser === 'safari'
      ? 'Safari'
      : browser === 'chrome'
        ? 'Google Chrome'
        : null
  if (!appName) return false

  // - If a tab starts with matchPrefix, focus it.
  // - Otherwise, open a new tab at targetUrl.
  // This gives “no new tab” on subsequent clicks.
  const appleScript = `
on run argv
  set matchPrefix to item 1 of argv
  set targetUrl to item 2 of argv
  tell application "${appName}"
    activate
    try
      repeat with w in windows
        repeat with t in tabs of w
          try
            set u to (URL of t) as string
            if u starts with matchPrefix then
              set index of w to 1
              ${appName === 'Safari' ? 'set current tab of w to t' : 'set active tab index of w to (index of t)'}
              return "found"
            end if
          end try
        end repeat
      end repeat
    end try

    try
      ${appName === 'Safari'
        ? 'tell window 1 to set current tab to (make new tab with properties {URL: targetUrl})'
        : 'tell window 1 to make new tab with properties {URL: targetUrl}'}
      return "opened"
    on error
      return "failed"
    end try
  end tell
end run
`

  try {
    const res = await execFileAsync('osascript', [
      '-e',
      appleScript,
      matchPrefix,
      targetUrl,
    ])
    const out = String(res.stdout || '').trim().toLowerCase()
    return out === 'found' || out === 'opened'
  } catch {
    return false
  }
}

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

  register('fireuxToolbar.catTree', async (uri, selectedUris) => {
    const targetUri =
      (Array.isArray(selectedUris) && selectedUris.length
        ? selectedUris[0]
        : uri) ??
      vscode.window.activeTextEditor?.document?.uri

    const targetCwd = cwdForUri(targetUri) ?? cwd
    const terminal = ensureNamedTerminal('Cat Tree', { cwd: targetCwd })

    if (targetCwd) {
      terminal.sendText(`cd ${shellQuotePosix(targetCwd)} && cat-tree`)
    } else {
      terminal.sendText('cat-tree')
    }
  })

  register('fireuxToolbar.catTreeToEditor', async (uri, selectedUris) => {
    const targetUri =
      (Array.isArray(selectedUris) && selectedUris.length
        ? selectedUris[0]
        : uri) ??
      vscode.window.activeTextEditor?.document?.uri

    const targetCwd = cwdForUri(targetUri) ?? cwd

    if (!targetCwd) {
      vscode.window.showErrorMessage('Cat Tree: no target folder found')
      return
    }

    try {
      const output = await buildCatTreeText(targetCwd, {
        maxFiles: 400,
        maxFileBytes: 512 * 1024,
        maxTotalBytes: 8 * 1024 * 1024,
      })
      const doc = await vscode.workspace.openTextDocument({
        language: 'plaintext',
        content: output,
      })
      await vscode.window.showTextDocument(doc, { preview: false })
    } catch (err) {
      const msg = String(err?.message || err || 'Failed to build cat-tree output')
      vscode.window.showErrorMessage(`Cat Tree failed: ${msg}`)
    }
  })

  register('fireuxToolbar.mirrorTreeToEditor', async (uri, selectedUris) => {
    const targetUri =
      (Array.isArray(selectedUris) && selectedUris.length
        ? selectedUris[0]
        : uri) ??
      vscode.window.activeTextEditor?.document?.uri

    const wsRootDir = cwd
    const mirrorDirFromSelection = targetUri?.fsPath
    const mirrorDir = mirrorDirFromSelection
      ? mirrorDirFromSelection
      : wsRootDir
        ? path.join(wsRootDir, 'mirror')
        : undefined

    if (!mirrorDir) {
      vscode.window.showErrorMessage('Mirror Tree: no target folder found')
      return
    }

    try {
      const st = await vscode.workspace.fs.stat(vscode.Uri.file(mirrorDir))
      if (st.type !== vscode.FileType.Directory) {
        vscode.window.showErrorMessage('Mirror Tree: target is not a folder')
        return
      }
    } catch {
      vscode.window.showErrorMessage(`Mirror Tree: folder not found: ${mirrorDir}`)
      return
    }

    try {
      const output = await buildMirrorTreeText(mirrorDir, {
        workspaceRootDir: wsRootDir,
        maxFiles: 800,
        maxFileBytes: 512 * 1024,
        maxTotalBytes: 12 * 1024 * 1024,
      })
      const doc = await vscode.workspace.openTextDocument({
        language: 'plaintext',
        content: output,
      })
      await vscode.window.showTextDocument(doc, { preview: false })
    } catch (err) {
      const msg = String(
        err?.message || err || 'Failed to build mirror-tree output'
      )
      vscode.window.showErrorMessage(`Mirror Tree failed: ${msg}`)
    }
  })

  register('fireuxToolbar.gitQPreview', async () => {
    if (!cwd) {
      vscode.window.showErrorMessage('Git Q: workspace root not found')
      return
    }

    let statusRes
    try {
      statusRes = await execFileAsync(
        'git',
        ['status', '--porcelain'],
        { cwd, maxBuffer: 4 * 1024 * 1024 }
      )
    } catch (err) {
      const msg = String(err?.stderr || err?.message || err || 'Git failed')
      vscode.window.showErrorMessage(`Git Q failed: ${msg}`)
      return
    }

    const lines = String(statusRes.stdout || '')
      .split('\n')
      .map((line) => line.replace(/\r$/, ''))
      .filter((line) => line.length > 0)

    const parseStatusLine = (line) => {
      if (line.startsWith('?? ')) {
        return { status: '??', relPath: line.slice(3) }
      }

      const status = line.slice(0, 2)
      const rest = line.slice(3)
      if (!rest) return null

      if (rest.includes(' -> ')) {
        const [oldPath, newPath] = rest.split(' -> ')
        if (!newPath) return null
        return { status, relPath: newPath, oldPath }
      }

      return { status, relPath: rest }
    }

    const entries = lines.map(parseStatusLine).filter(Boolean)

    const maxFileBytes = 512 * 1024
    const maxTotalBytes = 12 * 1024 * 1024
    let totalBytes = 0
    const chunks = []
    const push = (text) => {
      const next = totalBytes + Buffer.byteLength(text, 'utf8')
      if (next > maxTotalBytes) {
        if (totalBytes < maxTotalBytes) {
          chunks.push('\n[git-q output truncated: size exceeded]\n')
        }
        totalBytes = maxTotalBytes + 1
        return false
      }
      chunks.push(text)
      totalBytes = next
      return true
    }

    push('Git Q (working tree) contents\n')
    push(`Root: ${normalizeRelPath(cwd)}\n`)
    push(`Files: ${entries.length}\n`)

    if (!entries.length) {
      push('\n[no staged files found]\n')
    }

    for (const entry of entries) {
      if (totalBytes > maxTotalBytes) break
      const rel = normalizeRelPath(entry.relPath)
      const label = entry.oldPath
        ? `${entry.status} ${entry.oldPath} -> ${rel}`
        : `${entry.status} ${rel}`

      if (!push(`\n\n===== ${label} =====\n`)) break

      if (entry.status.includes('D')) {
        push('[deleted in index]\n')
        continue
      }

      try {
        const fileUri = vscode.Uri.file(path.join(cwd, entry.relPath))
        const data = await vscode.workspace.fs.readFile(fileUri)
        const buf = Buffer.from(data)
        if (isProbablyBinary(buf)) {
          push('[skipped: binary file]\n')
          continue
        }
        const text = new TextDecoder('utf-8', { fatal: false }).decode(buf)
        const bytes = Buffer.byteLength(text, 'utf8')
        if (bytes > maxFileBytes) {
          push(`[skipped: file too large (${bytes} bytes)]\n`)
          continue
        }
        push(text)
      } catch {
        push('[unreadable]\n')
      }
    }

    const output = chunks.join('')
    const doc = await vscode.workspace.openTextDocument({
      language: 'plaintext',
      content: output,
    })
    await vscode.window.showTextDocument(doc, { preview: false })
  })

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
      key: 'tenant',
      name: 'Tenant',
      icon: '$(home)',
      commandId: 'fireuxToolbar.startTenant',
      taskLabel: 'dev:tenant (3005)',
      terminalName: 'Tenant (3005)',
      pnpmCommand: 'pnpm dev:tenant',
      tooltip: 'Start Tenant dev (port 3005)',
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

  makeBtn(
    '$(git-commit) Git Q',
    'Show staged file contents',
    'fireuxToolbar.gitQPreview',
    91
  )
}

  // When the Git Tree task finishes, open the generated docs/git-tree.md
  const taskWatcher = vscode.tasks.onDidEndTaskProcess(async (e) => {
    try {
      const name = e.execution?.task?.name
      if (!name) return
      // Accept either exact match or the short label
      if (!name.includes('Git Tree')) return
      if (e.exitCode !== 0) return

      if (!ws) return
      const mdUri = vscode.Uri.joinPath(ws.uri, 'docs', 'git-tree.md')
      try {
        await vscode.workspace.fs.stat(mdUri)
      } catch {
        return
      }

      const doc = await vscode.workspace.openTextDocument(mdUri)
      await vscode.window.showTextDocument(doc, { preview: false })
    } catch {
      // noop
    }
  })
  context.subscriptions.push(taskWatcher)

function deactivate() {}

module.exports = { activate, deactivate }
