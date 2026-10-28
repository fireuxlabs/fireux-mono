import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

export const repoRoot = path.resolve(
  fileURLToPath(new URL('../..', import.meta.url))
)
const ignored = new Set([
  'node_modules',
  '.git',
  '.nuxt',
  '.output',
  'dist',
  'coverage',
  '.firebase',
  '.data',
  '.cache',
  '.nitro',
  'build',
  'mirror',
])

export function changedFiles(root) {
  const git = (...args) => {
    const result = spawnSync('git', args, { cwd: root, encoding: 'utf8' })
    if (result.status !== 0) throw new Error(result.stderr || 'git failed')
    return result.stdout.split('\0').filter(Boolean)
  }
  return [
    ...new Set([
      ...git('diff', '--name-only', '--diff-filter=ACMR', '-z', 'HEAD', '--'),
      ...git('ls-files', '--others', '--exclude-standard', '-z'),
    ]),
  ]
    .filter(
      (file) =>
        existsSync(path.join(root, file)) &&
        statSync(path.join(root, file)).isFile()
    )
    .sort()
}

export function ownerFor(root, target) {
  root = path.resolve(root)
  let directory = path.resolve(root, target)
  if (!existsSync(directory)) throw new Error(`Path does not exist: ${target}`)
  if (!statSync(directory).isDirectory()) directory = path.dirname(directory)
  if (directory !== root && !directory.startsWith(`${root}${path.sep}`)) {
    throw new Error('Choose a path inside this repository')
  }
  const relative = path.relative(root, directory).split(path.sep)
  if (relative[0] === 'tools' && relative.length >= 2)
    return path.join(root, relative[0], relative[1])
  while (directory !== root) {
    if (existsSync(path.join(directory, 'package.json'))) return directory
    directory = path.dirname(directory)
  }
  return root
}

export function testFiles(directory) {
  const files = []
  if (!existsSync(directory)) return files
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (ignored.has(entry.name) || entry.isSymbolicLink()) continue
    const target = path.join(directory, entry.name)
    if (entry.isDirectory()) files.push(...testFiles(target))
    else if (/\.test\.mjs$/.test(entry.name)) files.push(target)
  }
  return files.sort()
}

export function planChecks(root, mode, { scope, files = [] } = {}) {
  if (!['check', 'lint', 'format', 'test', 'typecheck'].includes(mode)) {
    throw new Error(`Unknown check: ${mode}`)
  }
  const owner = scope ? ownerFor(root, scope) : undefined
  const owners = owner
    ? [owner]
    : [...new Set(files.map((file) => ownerFor(root, file)))]
  const commands = []
  const add = (command, args, cwd = root) =>
    commands.push({ command, args, cwd })
  if (mode === 'check' || mode === 'lint') {
    const targets = owner
      ? [path.relative(root, owner) || '.']
      : files.filter((file) => /\.(?:[cm]?js|ts|vue)$/.test(file))
    if (targets.length) add('pnpm', ['exec', 'eslint', '--', ...targets])
  }
  if (mode === 'check' || mode === 'format') {
    const targets = owner ? [path.relative(root, owner) || '.'] : files
    if (targets.length)
      add('pnpm', [
        'exec',
        'prettier',
        '--check',
        '--ignore-unknown',
        '--',
        ...targets,
      ])
  }
  if (mode === 'check' || mode === 'test') {
    // A root-owned edit runs the tooling suite, never every App by accident.
    const tests = [
      ...new Set(
        owners.flatMap((directory) =>
          testFiles(
            directory === root ? path.join(root, 'tools/ide') : directory
          )
        )
      ),
    ]
    if (tests.length) add(process.execPath, ['--test', ...tests])
  }
  if (mode === 'check' || mode === 'typecheck') {
    for (const directory of owners) {
      if (directory === root) continue
      const relative = path.relative(root, directory).split(path.sep).join('/')
      if (relative.startsWith('projects/'))
        add('pnpm', ['exec', 'nuxi', 'typecheck'], directory)
      else if (existsSync(path.join(directory, 'tsconfig.json')))
        add('pnpm', ['exec', 'tsc', '--noEmit'], directory)
    }
  }
  return commands
}

export function runCommands(commands) {
  for (const { command, args, cwd } of commands) {
    console.log(
      `\n${path.relative(repoRoot, cwd) || '.'}: ${[command, ...args].map((arg) => JSON.stringify(arg)).join(' ')}`
    )
    const result = spawnSync(command, args, {
      cwd,
      stdio: 'inherit',
      shell: false,
    })
    if (result.error) throw result.error
    if (result.status !== 0) return result.status ?? 1
  }
  return 0
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    const [mode = 'check', ...args] = process.argv.slice(2)
    const positional = args.filter((arg) => !arg.startsWith('--'))
    if (
      positional.length > 1 ||
      args.some((arg) => arg.startsWith('--') && arg !== '--dry-run')
    )
      throw new Error(
        'Usage: check.mjs <check|lint|format|test|typecheck> [owner-path] [--dry-run]'
      )
    const scope = positional[0]
    const files = scope ? [] : changedFiles(repoRoot)
    const commands = planChecks(repoRoot, mode, { scope, files })
    if (args.includes('--dry-run'))
      console.log(JSON.stringify(commands, null, 2))
    else if (!commands.length)
      console.log('No applicable checks. No files were changed.')
    else process.exitCode = runCommands(commands)
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}
