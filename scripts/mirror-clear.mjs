import fs from 'node:fs'
import path from 'node:path'

const repoRoot = path.resolve(new URL('..', import.meta.url).pathname)
const mirrorDir = path.join(repoRoot, 'mirror')
const mirrorFilesDir = path.join(mirrorDir, 'files')
const listPath = path.join(mirrorDir, 'mirror.txt')

function ensureDirExists(dir) {
  fs.mkdirSync(dir, { recursive: true })
}

function clearMirrorDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const ent of entries) {
    const abs = path.join(dir, ent.name)
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
  ensureDirExists(mirrorFilesDir)
  if (!fs.existsSync(listPath)) {
    fs.writeFileSync(listPath, '', 'utf8')
  }

  clearMirrorDir(mirrorFilesDir)
  clearMirrorList(listPath)

  console.log('mirror-clear: removed generated files from mirror/files/ and cleared mirror.txt')
}

main()
