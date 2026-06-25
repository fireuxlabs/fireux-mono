#!/usr/bin/env node
// @fireux-script
// last_used: 2026-06-25
// usage_note: baseline after scripts cleanup; update when run.
import { execFile } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const repoRoot = path.resolve(new URL('..', import.meta.url).pathname)
const mirrorDir = path.join(repoRoot, 'mirror')
const listPath = path.join(mirrorDir, 'mirror.txt')

function execGitLines(args) {
  return new Promise((resolve, reject) => {
    execFile('git', args, { cwd: repoRoot }, (err, stdout, stderr) => {
      if (err) return reject(err)
      resolve(
        String(stdout || '')
          .split(/\r?\n/)
          .map((line) => line.replace(/\r$/, ''))
          .filter((line) => line.length > 0)
      )
    })
  })
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true })
}

async function main() {
  ensureDir(mirrorDir)

  // Get files waiting to be confirmed (staged + unstaged + untracked)
  let statusLines = []
  try {
    statusLines = await execGitLines(['status', '--porcelain'])
  } catch (err) {
    console.error('mirror-from-gitq: git status failed:', err?.message || err)
    process.exitCode = 2
    return
  }

  if (!statusLines.length) {
    console.log('mirror-from-gitq: no changes found (working tree clean)')
    process.exitCode = 0
    return
  }

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

  const entries = statusLines
    .map(parseStatusLine)
    .filter(Boolean)

  // Filter to repo-relative paths that exist
  const seen = new Set()
  const valid = []
  for (const entry of entries) {
    const rel = entry.relPath
    if (!rel) continue
    if (seen.has(rel)) continue
    seen.add(rel)
    if (entry.status?.includes('D')) continue
    const abs = path.join(repoRoot, rel)
    if (!abs.startsWith(repoRoot)) continue
    try {
      const st = fs.statSync(abs)
      if (st.isFile()) valid.push(rel)
      else if (st.isDirectory()) {
        // expand directories recursively
        const stack = [abs]
        while (stack.length) {
          const cur = stack.pop()
          for (const name of fs.readdirSync(cur)) {
            const child = path.join(cur, name)
            const st2 = fs.statSync(child)
            if (st2.isDirectory()) stack.push(child)
            else if (st2.isFile()) valid.push(path.relative(repoRoot, child))
          }
        }
      }
    } catch {
      // ignore missing
    }
  }

  if (!valid.length) {
    console.log('mirror-from-gitq: no valid files found in status list')
    process.exitCode = 0
    return
  }

  // Write mirror list (replace existing non-comment lines)
  const header =
    `# mirror list generated from git status (staged + unstaged + untracked)\n` +
    `# Run: node scripts/mirror-sync.mjs\n\n`
  const body = valid.map((p) => p.replaceAll('\\\\', '/')).join('\n') + '\n'
  fs.writeFileSync(listPath, header + body, 'utf8')
  console.log(`mirror-from-gitq: wrote ${valid.length} entries to ${path.relative(repoRoot, listPath)}`)

  // Run mirror-sync to create symlinks
  try {
    await new Promise((resolve, reject) => {
      execFile('node', ['scripts/mirror-sync.mjs'], { cwd: repoRoot }, (err, stdout, stderr) => {
        if (err) {
          console.error(String(stderr || '').trim())
          return reject(err)
        }
        process.stdout.write(String(stdout || ''))
        resolve()
      })
    })
  } catch (err) {
    console.error('mirror-from-gitq: mirror-sync failed:', err?.message || err)
    process.exitCode = 3
    return
  }
}

main()
