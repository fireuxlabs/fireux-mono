const vscode = require('vscode')
const path = require('node:path')
const {
  buildCatTreeText,
  buildMirrorTreeText,
  cwdForUri,
  execFileAsync,
  expandGitQEntries,
  normalizeRelPath,
  shellQuotePosix,
} = require('./toolbar-utils')

function registerFileTreeCommands({ register, cwd, ensureNamedTerminal }) {
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

    const parsedEntries = lines.map(parseStatusLine).filter(Boolean)
    const entries = await expandGitQEntries(cwd, parsedEntries)

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

}

module.exports = { registerFileTreeCommands }
