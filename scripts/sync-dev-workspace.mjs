#!/usr/bin/env node
// @fireux-script
// last_used: 2026-07-10
// usage_note: baseline after scripts cleanup; update when run.

import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import {
  APP_KEYS,
  APP_GROUPS,
  getAppGroupEntries,
  getAppRegistryEntries,
} from './_lib/app-registry.mjs'

const repoRoot = resolve(import.meta.dirname, '..')
const packageJsonPath = resolve(repoRoot, 'package.json')
const tasksPath = resolve(repoRoot, '.vscode/tasks.json')
const launchPath = resolve(repoRoot, '.vscode/launch.json')
const isDirectRun = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)

const backgroundMatcher = {
  owner: 'fireux-dev',
  pattern: {
    regexp: '^(?!)',
    message: 0,
  },
  background: {
    activeOnStart: true,
    endsPattern: '^\\[dev\\] .* smoke checks passed$',
  },
}

function sortApps(apps) {
  return [...apps].sort((a, b) => a.launchOrder - b.launchOrder)
}

function buildTasks() {
  const apps = sortApps(getAppRegistryEntries())

  return {
    version: '2.0.0',
    tasks: [
      {
        label: 'Git Tree (full)',
        type: 'shell',
        command: 'pnpm',
        args: ['git-tree:full'],
        presentation: {
          echo: true,
          reveal: 'always',
          focus: false,
          panel: 'shared',
        },
        problemMatcher: [],
      },
      {
        label: 'Git Tree',
        type: 'shell',
        command: 'pnpm',
        args: ['git-tree'],
        presentation: {
          echo: true,
          reveal: 'always',
          focus: false,
          panel: 'shared',
        },
        problemMatcher: [],
      },
      {
        label: 'Git Save',
        type: 'shell',
        command: 'pnpm',
        args: ['gitsave'],
        options: { cwd: '${workspaceFolder}' },
        presentation: {
          echo: true,
          reveal: 'always',
          focus: false,
          panel: 'dedicated',
        },
        problemMatcher: [],
      },
      ...apps.map((app) => ({
        label: `pnpm dev:${app.key}`,
        type: 'shell',
        command: 'pnpm',
        args: [`dev:${app.key}`],
        options: { cwd: '${workspaceFolder}' },
        isBackground: true,
        problemMatcher: backgroundMatcher,
        presentation: {
          reveal: 'always',
          focus: false,
          panel: 'dedicated',
        },
      })),
      ...apps.map((app) => ({
        label: `pnpm kill:${app.key}`,
        type: 'shell',
        command: 'pnpm',
        args: [`kill:${app.key}`],
        options: { cwd: '${workspaceFolder}' },
        problemMatcher: [],
        presentation: {
          reveal: 'always',
          focus: false,
          panel: 'shared',
        },
      })),
      {
        label: 'pnpm: build:packages',
        type: 'shell',
        command: 'pnpm',
        args: ['build:packages'],
        isBackground: false,
        problemMatcher: ['$tsc'],
        group: 'build',
      },
      {
        label: 'pnpm: lint',
        type: 'shell',
        command: 'pnpm',
        args: ['lint'],
        options: { cwd: '${workspaceFolder}' },
        isBackground: false,
        problemMatcher: ['$eslint-compact'],
        group: 'test',
      },
      {
        label: 'pnpm: typecheck',
        type: 'shell',
        command: 'pnpm',
        args: ['typecheck'],
        options: { cwd: '${workspaceFolder}' },
        isBackground: false,
        problemMatcher: ['$tsc'],
        group: 'build',
      },
      {
        label: 'pnpm: guard',
        type: 'shell',
        command: 'pnpm',
        args: ['guard'],
        options: { cwd: '${workspaceFolder}' },
        isBackground: false,
        problemMatcher: [],
        group: 'test',
      },
      {
        label: 'pnpm: release:check',
        type: 'shell',
        command: 'pnpm',
        args: ['release:check'],
        options: { cwd: '${workspaceFolder}' },
        isBackground: false,
        problemMatcher: [],
        group: 'test',
      },
      {
        label: 'pnpm: format',
        type: 'shell',
        command: 'pnpm',
        args: ['format'],
        options: { cwd: '${workspaceFolder}' },
        isBackground: false,
        problemMatcher: [],
      },
    ],
  }
}

function buildLaunchConfigurations() {
  const apps = sortApps(getAppRegistryEntries())

  return [
    {
      name: 'Run FireUX Toolbar Extension',
      type: 'extensionHost',
      request: 'launch',
      args: ['--extensionDevelopmentPath=${workspaceFolder}/tools/vscode-fireux-toolbar'],
    },
    {
      name: 'Git Tree',
      type: 'node-terminal',
      request: 'launch',
      command: 'pnpm git-tree',
      cwd: '${workspaceFolder}',
      presentation: { group: 'Dev Tools', order: 1 },
    },
    {
      name: 'Git Tree (full)',
      type: 'node-terminal',
      request: 'launch',
      command: 'pnpm git-tree:full',
      cwd: '${workspaceFolder}',
      presentation: { group: 'Dev Tools', order: 2 },
    },
    ...apps.map((app) => ({
      name: `${app.name} dev (${app.port})`,
      type: 'node-terminal',
      request: 'launch',
      command: `pnpm dev:${app.key}`,
      cwd: '${workspaceFolder}',
      presentation: { group: 'Dev Servers', order: app.launchOrder },
    })),
    ...apps.map((app) => ({
      name: `Kill ${app.name} dev (${app.port})`,
      type: 'node-terminal',
      request: 'launch',
      command: `pnpm kill:${app.key}`,
      cwd: '${workspaceFolder}',
      presentation: { group: 'Dev Servers', order: app.launchOrder + 100 },
    })),
  ]
}

function buildLaunchCompounds() {
  const compoundDefinitions = [
    { key: 'all', name: 'All dev servers (3000+3001+3002)' },
    { key: 'all-extended', name: 'All dev servers extended (3000-3005)' },
    { key: 'full', name: 'All dev servers full (3000-3010)' },
  ]

  return compoundDefinitions
    .filter((definition) => APP_GROUPS[definition.key])
    .map((definition) => ({
      name: definition.name,
      configurations: sortApps(getAppGroupEntries(definition.key)).map(
        (app) => `${app.name} dev (${app.port})`
      ),
    }))
}

function buildLaunch() {
  return {
    version: '0.2.0',
    configurations: buildLaunchConfigurations(),
    compounds: buildLaunchCompounds(),
  }
}

function buildDevScripts(existingScripts) {
  const nextScripts = { ...existingScripts }

  for (const key of APP_KEYS) {
    const app = getAppRegistryEntries([key])[0]
    nextScripts[`dev:${key}`] = `node scripts/dev-app-with-smoke.mjs --app ${key}`
    nextScripts[`kill:${key}`] = `node scripts/free-port.mjs ${app.port}`
  }

  nextScripts['dev:all'] = 'node scripts/dev-app-group.mjs --group all'
  nextScripts['dev:all-extended'] = 'node scripts/dev-app-group.mjs --group all-extended'
  nextScripts['dev:full'] = 'node scripts/dev-app-group.mjs --group full'
  nextScripts['sync:dev-workspace'] = 'node scripts/sync-dev-workspace.mjs'
  nextScripts['sync:dev-workspace:check'] = 'node scripts/sync-dev-workspace.mjs --check'

  return nextScripts
}

function parseArgs(argv) {
  return {
    check: argv.includes('--check'),
  }
}

async function buildGeneratedWorkspaceFiles() {
  const rawPackageJson = await readFile(packageJsonPath, 'utf8')
  const packageJson = JSON.parse(rawPackageJson)
  packageJson.scripts = buildDevScripts(packageJson.scripts || {})

  return {
    'package.json': `${JSON.stringify(packageJson, null, 2)}\n`,
    '.vscode/tasks.json': `${JSON.stringify(buildTasks(), null, 2)}\n`,
    '.vscode/launch.json': `${JSON.stringify(buildLaunch(), null, 2)}\n`,
  }
}

async function readCurrentWorkspaceFiles() {
  return {
    'package.json': await readFile(packageJsonPath, 'utf8'),
    '.vscode/tasks.json': await readFile(tasksPath, 'utf8'),
    '.vscode/launch.json': await readFile(launchPath, 'utf8'),
  }
}

export async function syncDevWorkspace(options = {}) {
  const { check = false, silent = false } = options
  const [expectedFiles, currentFiles] = await Promise.all([
    buildGeneratedWorkspaceFiles(),
    readCurrentWorkspaceFiles(),
  ])

  const driftedFiles = Object.keys(expectedFiles).filter(
    (filepath) => currentFiles[filepath] !== expectedFiles[filepath]
  )

  if (check) {
    if (driftedFiles.length) {
      throw new Error(
        [
          '[guard] ❌ Generated dev workspace files are out of sync:',
          ...driftedFiles.map((filepath) => `  - ${filepath}`),
          '',
          '[guard] Fix:',
          '  pnpm sync:dev-workspace',
        ].join('\n')
      )
    }

    if (!silent) {
      console.log(
        JSON.stringify(
          {
            ok: true,
            mode: 'check',
            files: Object.keys(expectedFiles),
          },
          null,
          2
        )
      )
    }

    return { ok: true, mode: 'check', driftedFiles: [] }
  }

  await Promise.all([
    writeFile(packageJsonPath, expectedFiles['package.json'], 'utf8'),
    writeFile(tasksPath, expectedFiles['.vscode/tasks.json'], 'utf8'),
    writeFile(launchPath, expectedFiles['.vscode/launch.json'], 'utf8'),
  ])

  const result = {
    ok: true,
    mode: 'write',
    files: Object.keys(expectedFiles),
    apps: sortApps(getAppRegistryEntries()).map((app) => ({
      key: app.key,
      port: app.port,
      workspace: app.workspace,
    })),
    compounds: Object.keys(APP_GROUPS),
  }

  if (!silent) {
    console.log(JSON.stringify(result, null, 2))
  }

  return result
}

if (isDirectRun) {
  const args = parseArgs(process.argv.slice(2))
  await syncDevWorkspace({ check: args.check })
}
