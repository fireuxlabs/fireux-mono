import fs from 'node:fs'
import path from 'node:path'

const repoRoot = path.resolve(new URL('..', import.meta.url).pathname)
const mirrorDir = path.join(repoRoot, 'mirror')
const listPath = path.join(mirrorDir, 'mirror.txt')

function isKeepFile(baseName) {
  return baseName === 'README.md' || baseName === 'mirror.txt'
}

function linkNameFromRelPath(relPath) {
  // Flat mirror: build a readable name from key path segments.
  // Examples:
  // - packages/core/fireux-core/.../organisms/App/Edit/Admin.vue
  //   -> core-App-Edit-Admin.vue
  // - packages/extensions/fireux-jobs/.../organisms/profiles/Agent/Cards/Cell.vue
  //   -> jobs-profiles-Agent-Cards-Cell.vue

  const parts = relPath.split('/').filter(Boolean)
  const packagesIndex = parts.indexOf('packages')

  let pkgSlug = 'repo'
  let tail = parts

  if (packagesIndex !== -1 && parts.length > packagesIndex + 2) {
    const scope = parts[packagesIndex + 1]
    const pkgName = parts[packagesIndex + 2]
    pkgSlug =
      pkgName === 'fireux-core'
        ? 'core'
        : pkgName.startsWith('fireux-')
          ? pkgName.slice('fireux-'.length)
          : `${scope}-${pkgName}`

    const organismsIndex = parts.indexOf('organisms')
    if (organismsIndex !== -1) {
      tail = parts.slice(organismsIndex + 1)
    } else {
      // Fallback: take the last few segments.
      tail = parts.slice(-6)
    }
  }

  const cleaned = tail
    .map((seg) => seg.replace(/\.(vue|ts|js|mjs)$/i, (m) => m))
    .map((seg) => seg.replaceAll(' ', '-'))
    .map((seg) => seg.replaceAll('_', '-'))

  // Keep extension on last segment; make everything else dash-joined.
  return [pkgSlug, ...cleaned].join('-')
}

function readMirrorList(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8')
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
}

function collectFilesRecursive(absPath) {
  const stat = fs.statSync(absPath)
  if (stat.isFile()) return [absPath]
  if (!stat.isDirectory()) return []

  const out = []
  const entries = fs.readdirSync(absPath, { withFileTypes: true })
  for (const ent of entries) {
    const childAbs = path.join(absPath, ent.name)
    if (ent.isDirectory()) {
      out.push(...collectFilesRecursive(childAbs))
    } else if (ent.isFile()) {
      out.push(childAbs)
    }
  }
  return out
}

function ensureDirExists(dir) {
  fs.mkdirSync(dir, { recursive: true })
}

function removeGeneratedSymlinks(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const base = ent.name
    if (isKeepFile(base)) continue

    const abs = path.join(dir, base)

    // Mirror guardrail: no subfolders under mirror.
    if (ent.isDirectory()) {
      throw new Error(`mirror-sync: unexpected directory under mirror/: ${base}`)
    }

    // Remove any existing symlink (and also stale regular files if present).
    try {
      fs.rmSync(abs, { force: true })
    } catch (err) {
      throw new Error(`mirror-sync: failed to remove ${abs}: ${err?.message || err}`)
    }
  }
}

function createSymlink({ linkAbsPath, targetAbsPath }) {
  const linkDir = path.dirname(linkAbsPath)
  const relativeTarget = path.relative(linkDir, targetAbsPath)

  try {
    fs.symlinkSync(relativeTarget, linkAbsPath)
  } catch (err) {
    throw new Error(
      `mirror-sync: failed to symlink ${linkAbsPath} -> ${relativeTarget}: ${err?.message || err}`
    )
  }
}

function main() {
  ensureDirExists(mirrorDir)
  if (!fs.existsSync(listPath)) {
    throw new Error(`mirror-sync: missing ${path.relative(repoRoot, listPath)}`)
  }

  const relEntries = readMirrorList(listPath)
  removeGeneratedSymlinks(mirrorDir)

  const created = []
  const usedNames = new Map()

  const relPaths = []
  for (const entry of relEntries) {
    const entryAbs = path.join(repoRoot, entry)
    if (!fs.existsSync(entryAbs)) {
      console.warn(`mirror-sync: missing target: ${entry}`)
      continue
    }

    const stat = fs.statSync(entryAbs)
    if (stat.isDirectory()) {
      const filesAbs = collectFilesRecursive(entryAbs)
      for (const fAbs of filesAbs) {
        relPaths.push(path.relative(repoRoot, fAbs))
      }
    } else {
      relPaths.push(entry)
    }
  }

  relPaths.sort((a, b) => a.localeCompare(b))

  for (const rel of relPaths) {
    const targetAbs = path.join(repoRoot, rel)
    if (!fs.existsSync(targetAbs)) continue

    const baseName = linkNameFromRelPath(rel)
    const count = (usedNames.get(baseName) || 0) + 1
    usedNames.set(baseName, count)
    const linkName = count === 1 ? baseName : `${baseName}--${count}`
    const linkAbs = path.join(mirrorDir, linkName)

    createSymlink({ linkAbsPath: linkAbs, targetAbsPath: targetAbs })
    created.push(linkName)
  }

  console.log(`mirror-sync: created ${created.length} symlinks in mirror/`)
}

main()
