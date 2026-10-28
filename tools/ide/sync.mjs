import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getAppRegistryEntries } from '../fireux-launcher/apps.mjs'

export function buildIdeFiles(root, apps) {
  const json = (value) => `${JSON.stringify(value, null, 2)}\n`
  const task = (label, args, problemMatcher = []) => ({
    label,
    type: 'process',
    command: 'pnpm',
    args,
    options: { cwd: '${workspaceFolder}' },
    problemMatcher,
    presentation: { reveal: 'always', panel: 'dedicated' },
  })
  const tasks = [task('Git Save', ['gitsave'])]
  const configurations = [
    {
      name: 'Run FireUX Toolbar Extension',
      type: 'extensionHost',
      request: 'launch',
      args: [
        '--extensionDevelopmentPath=${workspaceFolder}/tools/vscode-fireux-toolbar',
      ],
    },
  ]
  for (const app of apps) {
    const relative = path
      .relative(root, app.directory)
      .split(path.sep)
      .join('/')
    tasks.push(task(`pnpm dev:${app.key}`, ['--dir', relative, 'dev']))
    if (app.killScript)
      tasks.push(task(`pnpm kill:${app.key}`, [app.killScript]))
    const browser = `Browser: ${app.key}`
    configurations.push(
      {
        name: `Debug: ${app.key} (${app.port})`,
        type: 'node-terminal',
        request: 'launch',
        command: `pnpm --dir '${relative.replaceAll("'", "'\"'\"'")}' dev`,
        cwd: '${workspaceFolder}',
        serverReadyAction: {
          pattern: 'Nitro server built|Nuxt Nitro server built',
          action: 'startDebugging',
          name: browser,
          killOnServerStop: true,
        },
      },
      {
        name: browser,
        type: 'pwa-chrome',
        request: 'launch',
        url: app.baseUrl,
        webRoot: `\${workspaceFolder}/${relative}`,
        sourceMaps: true,
        presentation: { group: 'Browser sessions' },
      }
    )
  }
  tasks.push(
    task(
      'FireUX: Check changed files',
      ['check:changed'],
      ['$eslint-stylish', '$tsc']
    ),
    task('FireUX: Lint changed files', ['lint:changed'], '$eslint-stylish'),
    task('FireUX: Check formatting of changed files', ['format:changed']),
    task('FireUX: Test current owner', ['test:scope', '${file}']),
    task(
      'FireUX: Typecheck current owner',
      ['typecheck:scope', '${file}'],
      '$tsc'
    ),
    task(
      'FireUX: Check current owner',
      ['check:scope', '${file}'],
      ['$eslint-stylish', '$tsc']
    ),
    task('FireUX: Unit tests', ['test:unit']),
    task('FireUX: Verify IDE configuration', ['ide:check'])
  )
  const files = new Map([
    ['.vscode/tasks.json', json({ version: '2.0.0', tasks })],
    ['.vscode/launch.json', json({ version: '0.2.0', configurations })],
    [
      'fireux-mono.code-workspace',
      json({ folders: [{ name: 'FireUX Mono', path: '.' }], settings: {} }),
    ],
  ])
  const ecosystems = readdirSync(path.join(root, 'projects'), {
    withFileTypes: true,
  })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
  for (const ecosystem of [
    ...new Set(apps.map((app) => app.ecosystem)),
  ].sort()) {
    const name = `${ecosystem}.code-workspace`
    files.set(
      `.vscode/workspaces/${name}`,
      json({
        folders: [{ name: `${ecosystem} — FireUX Mono`, path: '../..' }],
        settings: {
          'window.title': `${ecosystem} — \${activeEditorShort}`,
          'files.exclude': Object.fromEntries(
            ecosystems
              .filter((key) => key !== ecosystem)
              .map((key) => [`projects/${key}`, true])
          ),
        },
      })
    )
  }
  return files
}

export function syncIde(root, { check = false } = {}) {
  const files = buildIdeFiles(root, getAppRegistryEntries(root))
  const changed = []
  for (const [relative, content] of files) {
    const target = path.join(root, relative)
    if (existsSync(target) && readFileSync(target, 'utf8') === content) continue
    changed.push(relative)
    if (!check) {
      mkdirSync(path.dirname(target), { recursive: true })
      writeFileSync(target, content)
    }
  }
  return changed
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const root = fileURLToPath(new URL('../..', import.meta.url))
  const check = process.argv.includes('--check')
  const changed = syncIde(root, { check })
  console.log(
    changed.length
      ? `${check ? 'Stale' : 'Updated'} IDE files:\n${changed.join('\n')}`
      : 'IDE configuration is current.'
  )
  if (check && changed.length) process.exitCode = 1
}
