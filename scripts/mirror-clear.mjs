import fs from 'node:fs'
import path from 'node:path'

const repoRoot = path.resolve(new URL('..', import.meta.url).pathname)
const mirrorDir = path.join(repoRoot, 'mirror')
const listPath = path.join(mirrorDir, 'mirror.txt')

function isKeepFile(baseName) {
  return baseName === 'README.md' || baseName === 'mirror.txt'
}

function ensureDirExists(dir) {
  fs.mkdirSync(dir, { recursive: true })
}

function clearMirrorDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const ent of entries) {
    const base = ent.name
    if (isKeepFile(base)) continue
    const abs = path.join(dir, base)
    try {
      fs.rmSync(abs, { force: true, recursive: true })
    } catch (err) {
      throw new Error(`mirror-clear: failed to remove ${abs}: ${err?.message || err}`)
    }
  }
}

function clearMirrorList(filePath) {
  fs.writeFileSync(filePath, '', 'utf8')
}

function main() {
  ensureDirExists(mirrorDir)
  if (!fs.existsSync(listPath)) {
    fs.writeFileSync(listPath, '', 'utf8')
  }

  clearMirrorDir(mirrorDir)
  clearMirrorList(listPath)

  console.log('mirror-clear: removed symlinks and cleared mirror.txt (README kept)')
}

main()
