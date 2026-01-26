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
  // - packages/core/fireux-core/src/runtime/components/dev/HealthPanel.vue
  //   -> core-dev-HealthPanel.vue
  // - packages/core/fireux-core/src/runtime/pages/dev/index.vue
  //   -> core-dev-index.vue
  // - packages/core/fireux-core/src/runtime/server/api/dev/images.get.ts
  //   -> core-api-dev-images.get.ts

  function normalizeModelTail(modelParts) {
    // Human-friendly: chef-model.ts, supplier-model.ts, app-interface.ts, user-interface.ts, etc.
    if (!Array.isArray(modelParts) || modelParts.length === 0) return modelParts

    // Look for Chef/Supplier/App/User and model/interface in the path
    const last = modelParts[modelParts.length - 1]
    const prev = modelParts.length >= 2 ? modelParts[modelParts.length - 2] : ''
    const lcLast = last.toLowerCase()
    const lcPrev = prev.toLowerCase()

    // Model files: Chef.model.ts, Supplier.model.ts, etc.
    if (lcLast.endsWith('.model.ts')) {
      const entity = lcPrev || lcLast.replace('.model.ts', '')
      return [`${entity}-model.ts`]
    }
    // Interface files: useChefInterface.ts, useSupplierInterface.ts, etc.
    if (lcLast.startsWith('use') && lcLast.endsWith('interface.ts')) {
      // useChefInterface.ts -> chef-interface.ts
      const entity = lcLast.replace(/^use/i, '').replace(/interface\.ts$/i, '')
      return [`${entity}-interface.ts`]
    }
    // Fallback: just use the last segment, lowercased
    return [lcLast]
  }

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
      // Use stable anchors to keep names short and human-readable.
      // Prefer the closest semantic segment under src/runtime.
      const runtimeIndex = parts.indexOf('runtime')

      const componentsIndex = parts.indexOf('components')
      const layoutsIndex = parts.indexOf('layouts')
      const pagesIndex = parts.indexOf('pages')
      const composablesIndex = parts.indexOf('composables')
      const modelsIndex = parts.indexOf('models')
      const apiIndex = parts.indexOf('api')

      if (layoutsIndex !== -1 && componentsIndex !== -1) {
        // Keep the "layouts" context to avoid collisions (e.g. layouts/dev/Nav.vue).
        tail = parts.slice(layoutsIndex)
      } else if (componentsIndex !== -1) {
        tail = parts.slice(componentsIndex + 1)
      } else if (pagesIndex !== -1) {
        tail = parts.slice(pagesIndex + 1)
      } else if (composablesIndex !== -1) {
        tail = parts.slice(composablesIndex + 1)
      } else if (modelsIndex !== -1) {
        tail = normalizeModelTail(parts.slice(modelsIndex + 1))
      } else if (apiIndex !== -1) {
        tail = ['api', ...parts.slice(apiIndex + 1)]
      } else if (runtimeIndex !== -1) {
        // Fallback: everything after runtime.
        tail = parts.slice(runtimeIndex + 1)
      } else {
        // Last resort fallback.
        tail = parts.slice(-4)
      }
    }
  }

  function titleCase(text) {
    return text
      .split(' ')
      .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : word))
      .join(' ')
  }

  function humanizeSegment(seg) {
    const ext = path.extname(seg)
    const base = ext ? seg.slice(0, -ext.length) : seg
    let text = base
    text = text.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    text = text.replace(/[_-]+/g, ' ')
    text = text.replace(/\s+/g, ' ').trim()
    text = titleCase(text)
    return ext ? `${text}${ext}` : text
  }

  const prettyTail = tail.map(humanizeSegment).filter(Boolean)
  const fileName = prettyTail.at(-1)
  const context = prettyTail.slice(0, -1).reverse()
  const segments = fileName ? [fileName, ...context] : context

  if (pkgSlug && pkgSlug !== 'repo') {
    segments.push(humanizeSegment(pkgSlug))
  }

  // Human-readable names with the filename first, then context and package.
  return segments.join(' — ')
}

function readMirrorList(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8')
  // Return array of { path, linkName } objects
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => {
      // Support an optional `# custom-name` comment after the path.
      // If the comment omits an extension, infer it from the target path.
      const parts = line.split('#')
      const relPath = parts[0].trim()
      const rawComment = parts.slice(1).join('#').trim()

      let linkName = undefined
      if (rawComment) {
        const targetExt = path.extname(relPath) || '.ts'
        // If the comment already contains an extension, use it as-is.
        if (path.extname(rawComment)) {
          linkName = rawComment
        } else {
          linkName = `${rawComment}${targetExt}`
        }
      }

      return { path: relPath, linkName }
    })
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
    const entryAbs = path.join(repoRoot, entry.path)
    if (!fs.existsSync(entryAbs)) {
      console.warn(`mirror-sync: missing target: ${entry.path}`)
      continue
    }

    const stat = fs.statSync(entryAbs)
    if (stat.isDirectory()) {
      const filesAbs = collectFilesRecursive(entryAbs)
      for (const fAbs of filesAbs) {
        relPaths.push({ path: path.relative(repoRoot, fAbs), linkName: undefined })
      }
    } else {
      relPaths.push(entry)
    }
  }

  relPaths.sort((a, b) => a.path.localeCompare(b.path))

  for (const rel of relPaths) {
    const targetAbs = path.join(repoRoot, rel.path)
    if (!fs.existsSync(targetAbs)) continue

    const baseName = rel.linkName || linkNameFromRelPath(rel.path)
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
