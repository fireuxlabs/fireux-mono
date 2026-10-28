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

async function expandGitQEntries(cwd, entries) {
  const expanded = []

  for (const entry of entries) {
    if (entry.status.includes('D')) {
      expanded.push(entry)
      continue
    }

    const abs = path.join(cwd, entry.relPath)
    let stat
    try {
      stat = await vscode.workspace.fs.stat(vscode.Uri.file(abs))
    } catch {
      expanded.push(entry)
      continue
    }

    const isDir = (stat.type & vscode.FileType.Directory) === vscode.FileType.Directory
    if (!isDir) {
      expanded.push(entry)
      continue
    }

    const files = await collectFilesRecursive(vscode.workspace.fs, abs, { maxFiles: 200 })
    if (!files.length) {
      expanded.push(entry)
      continue
    }

    files.sort((a, b) => a.localeCompare(b))
    for (const fileAbs of files) {
      expanded.push({
        ...entry,
        relPath: normalizeRelPath(path.relative(cwd, fileAbs)),
      })
    }
  }

  return expanded
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

function findRepoRoot(startDir) {
  let current = startDir && path.resolve(startDir)
  while (current) {
    const hasWorkspace = fs.existsSync(path.join(current, 'pnpm-workspace.yaml'))
    const hasRegistry = fs.existsSync(
      path.join(current, 'tools', 'fireux-launcher', 'apps.mjs')
    )
    if (hasWorkspace && hasRegistry) return current

    const parent = path.dirname(current)
    if (parent === current) return undefined
    current = parent
  }
  return undefined
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


module.exports = {
  buildCatTreeText,
  buildMirrorTreeText,
  cwdForUri,
  execFileAsync,
  expandGitQEntries,
  findRepoRoot,
  normalizeRelPath,
  safeOrigin,
  shellQuotePosix,
  tryReuseTabMacOS,
}
