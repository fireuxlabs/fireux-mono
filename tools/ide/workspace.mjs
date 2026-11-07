import { existsSync, readFileSync, realpathSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { repoRoot } from './check.mjs'

export function codeCommand() {
  const executable = process.platform === 'win32' ? 'code.cmd' : 'code'
  const onPath = (process.env.PATH ?? '')
    .split(path.delimiter)
    .map((directory) => path.join(directory, executable))
    .find(existsSync)
  if (onPath) return onPath
  const mac =
    '/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code'
  if (process.platform === 'darwin' && existsSync(mac)) return mac
  throw new Error(
    'VS Code CLI is unavailable. Install the code command from the VS Code Command Palette.'
  )
}

export function openArguments(root, targets = []) {
  root = realpathSync(root)
  const workspace = path.join(root, 'fireux-mono.code-workspace')
  if (!existsSync(workspace))
    throw new Error(`Missing workspace: ${workspace}. Run pnpm ide:sync.`)
  const files = targets.map((target) => {
    const match = /^(.*?)(:\d+(?::\d+)?)?$/.exec(target)
    const file = realpathSync(path.resolve(root, match[1]))
    if (!file.startsWith(`${root}${path.sep}`))
      throw new Error(`File belongs to another checkout: ${target}`)
    return `${file}${match[2] ?? ''}`
  })
  return [
    '--reuse-window',
    workspace,
    ...(files.length ? ['--goto', ...files] : []),
  ]
}

export function doctor(root = repoRoot) {
  const manifest = JSON.parse(
    readFileSync(path.join(root, 'package.json'), 'utf8')
  )
  const expectedNode = readFileSync(
    path.join(root, '.node-version'),
    'utf8'
  ).trim()
  const expectedPnpm = manifest.packageManager.replace(/^pnpm@/, '')
  const checks = []
  const add = (name, actual, expected) =>
    checks.push({ name, actual, expected, ok: actual === expected })
  const git = spawnSync('git', ['rev-parse', '--show-toplevel'], {
    cwd: root,
    encoding: 'utf8',
  })
  add('Checkout', git.stdout?.trim(), root)
  add('Node', process.versions.node, expectedNode)
  add(
    'nvm pin',
    readFileSync(path.join(root, '.nvmrc'), 'utf8').trim(),
    expectedNode
  )
  const pnpm = spawnSync('pnpm', ['--version'], { cwd: root, encoding: 'utf8' })
  add(
    'pnpm',
    pnpm.stdout?.trim() || pnpm.error?.message || 'unavailable',
    expectedPnpm
  )
  const require = createRequire(path.join(root, 'package.json'))
  for (const name of ['typescript', 'vue-tsc', 'eslint', 'prettier']) {
    let installed = false
    try {
      require.resolve(name)
      installed = true
    } catch {
      /* Report below. */
    }
    add(name, installed ? 'installed' : 'missing', 'installed')
  }
  try {
    checks.push({ name: 'VS Code CLI', actual: codeCommand(), ok: true })
  } catch (error) {
    checks.push({ name: 'VS Code CLI', actual: error.message, ok: false })
  }
  return checks
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    const [mode, ...args] = process.argv.slice(2)
    if (mode === 'doctor' && !args.length) {
      const checks = doctor()
      for (const check of checks)
        console.log(
          `${check.ok ? 'OK' : 'FAIL'} ${check.name}: ${check.actual}${!check.ok && check.expected ? ` (expected ${check.expected})` : ''}`
        )
      console.log(
        'Editor activation and desktop IDE-context sharing still require a live UI check.'
      )
      process.exitCode = checks.every((check) => check.ok) ? 0 : 1
    } else if (mode === 'open') {
      const dryRun = args.includes('--dry-run')
      const command = codeCommand()
      const openArgs = openArguments(
        repoRoot,
        args.filter((arg) => arg !== '--dry-run')
      )
      if (dryRun)
        console.log(JSON.stringify({ command, args: openArgs }, null, 2))
      else {
        const result = spawnSync(command, openArgs, {
          cwd: repoRoot,
          stdio: 'inherit',
          shell: false,
        })
        if (result.error) throw result.error
        process.exitCode = result.status ?? 1
      }
    } else
      throw new Error(
        'Usage: workspace.mjs doctor | open [file[:line[:column]] ...] [--dry-run]'
      )
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}
