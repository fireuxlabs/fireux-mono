// test-reg.js
// Scans all packages and reports what is registered and accessible (components, composables, layouts, pages)
// Interactive UX: prompts user for what to test (matches module.ts config steps)

const fs = require('fs')
const path = require('path')
const readline = require('readline')

const MONOREPO_ROOT = path.resolve(__dirname, '..')
const PKG_ROOT = path.join(MONOREPO_ROOT, 'packages')

const PACKAGES = fs
  .readdirSync(PKG_ROOT)
  .filter(
    (dir) =>
      fs.statSync(path.join(PKG_ROOT, dir)).isDirectory() &&
      !dir.startsWith('.')
  )

function scanDir(dir, exts = ['.js', '.ts', '.vue']) {
  if (!fs.existsSync(dir)) return []
  const files = []
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry)
    if (fs.statSync(full).isDirectory()) {
      files.push(...scanDir(full, exts))
    } else if (exts.some((e) => entry.endsWith(e))) {
      files.push(full)
    }
  }
  return files
}

function relativeToPackage(file, pkg) {
  return file.replace(path.join(PKG_ROOT, pkg) + '/', '')
}

function getTSPaths(pkg) {
  const tsconfigPath = path.join(PKG_ROOT, pkg, 'tsconfig.json')
  if (!fs.existsSync(tsconfigPath)) return {}
  try {
    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf-8'))
    return (tsconfig.compilerOptions && tsconfig.compilerOptions.paths) || {}
  } catch {
    return {}
  }
}

function resolveTSPath(pkg, relPath) {
  const paths = getTSPaths(pkg)
  for (const alias in paths) {
    const [target] = paths[alias]
    const aliasPrefix = target.replace(/\*$/, '')
    if (relPath.startsWith(aliasPrefix)) {
      return alias.replace(/\*$/, '') + relPath.slice(aliasPrefix.length)
    }
  }
  return null
}

function printHowToAccess(type, relPath, pkg) {
  let appAccess = '',
    pkgAccess = ''
  if (type === 'component') {
    appAccess = `auto-imported as <FireXxx> (prefix from module options)`
    pkgAccess = `not directly accessible unless exported`
  } else if (type === 'composable') {
    appAccess = `auto-imported: use${relPath.split('/').pop().replace('.ts', '')} (within same package, just use directly; import only needed for async/await or cross-package usage)`
    const tsPath = resolveTSPath(
      pkg,
      'src/runtime/composables/' + relPath.split('/').pop()
    )
    if (tsPath) {
      pkgAccess = `import { ... } from '${pkg}/${tsPath}'`
    } else {
      pkgAccess = `import { ... } from '${pkg}/src/runtime/composables/${relPath.split('/').pop()}'`
    }
  } else if (type === 'layout') {
    appAccess = `Nuxt layout: definePageMeta({ layout: '${relPath.replace('.vue', '')}' })`
    pkgAccess = `import Layout from '${pkg}/src/runtime/layouts/${relPath}'`
  } else if (type === 'page') {
    appAccess = `Nuxt page: /${relPath.replace('.vue', '')}`
    pkgAccess = `import Page from '${pkg}/src/runtime/pages/${relPath}'`
  } else if (type === 'asset') {
    appAccess = `public asset: /_nuxt/assets/${relPath}`
    pkgAccess = `import Asset from '${pkg}/src/runtime/assets/${relPath}'`
  } else if (type === 'model') {
    const modelName = path.basename(relPath, '.ts').replace('.model', '')
    const dirPath = path.dirname(relPath).replace('src/runtime/models/', '')
    appAccess = `import type { ${modelName} } from '#${pkg}-models/${dirPath}/${modelName}.model'`

    // For cross-package imports, show the correct relative path
    if (pkg === 'fireux-core') {
      pkgAccess = `import type { ${modelName} } from '../../../../../${pkg}/src/runtime/models/${relPath}'`
    } else {
      pkgAccess = `import type { ${modelName} } from '${pkg}/src/runtime/models/${relPath}'`
    }
  }
  return { appAccess, pkgAccess }
}

function printSection(type) {
  for (const pkg of PACKAGES) {
    const base = path.join(PKG_ROOT, pkg)
    if (!fs.existsSync(base)) continue
    console.log(`\n=== ${pkg} ===`)
    let dir, files, label
    if (type === 'component') {
      dir = path.join(base, 'src/runtime/components')
      files = scanDir(dir, ['.vue'])
      label = 'Components'
    } else if (type === 'layout') {
      dir = path.join(base, 'src/runtime/layouts')
      files = scanDir(dir, ['.vue'])
      label = 'Layouts'
    } else if (type === 'page') {
      dir = path.join(base, 'src/runtime/pages')
      files = scanDir(dir, ['.vue'])
      label = 'Pages'
    } else if (type === 'composable') {
      dir = path.join(base, 'src/runtime/composables')
      files = scanDir(dir, ['.ts'])
      label = 'Composables'
    } else if (type === 'asset') {
      dir = path.join(base, 'src/runtime/assets')
      files = scanDir(dir)
      label = 'Assets'
    } else if (type === 'model') {
      dir = path.join(base, 'src/runtime/models')
      files = scanDir(dir, ['.ts'])
      label = 'Models'
    }
    if (files && files.length) {
      console.log(`\n${label}:`)
      for (const f of files) {
        const rel = relativeToPackage(f, pkg)
        const { appAccess, pkgAccess } = printHowToAccess(type, rel, pkg)
        console.log(
          `- ${rel}\n  from: ${f}\n  app:   ${appAccess}\n  pkg:   ${pkgAccess}`
        )
      }
    }
  }
}

function printAll() {
  printSection('component')
  printSection('layout')
  printSection('page')
  printSection('composable')
  printSection('model')
  printSection('asset')
  printStub('server')
  printStub('runtime')
  printStub('plugin')
}

function printStub(type) {
  let label = ''
  if (type === 'server') label = 'Server-side functionality'
  if (type === 'runtime') label = 'Runtime options'
  if (type === 'plugin') label = 'Plugins'
  if (label) {
    console.log(`\n${label}:`)
    console.log('  Configured via code. Not directly scannable by this script.')
  }
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

console.log('What do you want to test?')
console.log(
  '0 = All, 1 = Components, 2 = Layouts, 3 = Pages, 4 = Composables, 5 = Models, 6 = Server-side, 7 = Runtime options, 8 = Plugins, 9 = Public assets'
)
rl.question('Enter a number: ', (answer) => {
  if (answer === '0') printAll()
  else if (answer === '1') printSection('component')
  else if (answer === '2') printSection('layout')
  else if (answer === '3') printSection('page')
  else if (answer === '4') printSection('composable')
  else if (answer === '5') printSection('model')
  else if (answer === '6') printStub('server')
  else if (answer === '7') printStub('runtime')
  else if (answer === '8') printStub('plugin')
  else if (answer === '9') printSection('asset')
  else console.log('Invalid input.')
  rl.close()
  console.log('\nNote:')
  console.log(
    '- Components and composables are auto-imported if the corresponding config file exists in the package.'
  )
  console.log(
    '- Layouts and pages are registered via Nuxt module hooks or direct import.'
  )
  console.log(
    '- For direct import, use the relative path shown above from the package root.'
  )
})
