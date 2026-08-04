// @fireux-script
// last_used: 2026-08-04
// usage_note: derive validated VS Code toolbar App data from the canonical App registry and toolbar-only presentation choices.

import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { format, resolveConfig } from 'prettier'

function commandSuffix(key) {
  return key
    .split('-')
    .filter(Boolean)
    .map((part) => `${part[0]?.toUpperCase() ?? ''}${part.slice(1)}`)
    .join('')
}

function normalizeCommandSuffix(value) {
  return value.replace(/[^a-z0-9]/gi, '').toLowerCase()
}

function resolveCommandId(appKey, contributedCommands) {
  const commandPrefix = 'fireuxToolbar.start'
  const normalizedKey = normalizeCommandSuffix(appKey)
  const compatibleCommands = contributedCommands.filter((commandId) => {
    if (!commandId.startsWith(commandPrefix)) return false

    return (
      normalizeCommandSuffix(commandId.slice(commandPrefix.length)) ===
      normalizedKey
    )
  })

  if (compatibleCommands.length > 1) {
    throw new Error(
      `Toolbar App ${appKey} matches multiple contributed commands: ${compatibleCommands.join(', ')}`
    )
  }

  return compatibleCommands[0] || `${commandPrefix}${commandSuffix(appKey)}`
}

function toolbarAppRecord(app, presentation, contributedCommands) {
  return {
    key: app.key,
    ecosystem: app.ecosystem,
    name: app.name,
    icon: presentation.icon || '$(server-process)',
    port: app.port,
    commandId: resolveCommandId(app.key, contributedCommands),
    taskLabel: `pnpm dev:${app.key}`,
    terminalName: `${app.name} (${app.port})`,
    pnpmCommand: `pnpm dev:${app.key} --host`,
    tooltip: `Start ${app.name} dev (port ${app.port})`,
    url: `http://localhost:${app.port}`,
  }
}

function assertPresentation(presentation, registryApps) {
  if (
    !presentation ||
    typeof presentation !== 'object' ||
    Array.isArray(presentation)
  ) {
    throw new Error('Toolbar presentation source must be an object.')
  }

  const appPresentation = presentation.apps
  if (
    !appPresentation ||
    typeof appPresentation !== 'object' ||
    Array.isArray(appPresentation)
  ) {
    throw new Error('Toolbar presentation source must declare an apps object.')
  }

  const registryKeys = new Set(registryApps.map((app) => app.key))
  const staleKeys = Object.keys(appPresentation).filter(
    (key) => !registryKeys.has(key)
  )
  if (staleKeys.length) {
    throw new Error(
      `Toolbar presentation contains unknown App keys: ${staleKeys.join(', ')}`
    )
  }

  if (!Array.isArray(presentation.extras)) {
    throw new Error('Toolbar presentation source must declare an extras array.')
  }

  const conflictingExtras = presentation.extras
    .map((app) => app.key)
    .filter((key) => registryKeys.has(key))
  if (conflictingExtras.length) {
    throw new Error(
      `Toolbar extras conflict with registry App keys: ${conflictingExtras.join(', ')}`
    )
  }
}

function assertToolbarEntries(apps, toolbarPackage) {
  const duplicateValues = (values) =>
    values.filter((value, index) => values.indexOf(value) !== index)

  const duplicateKeys = duplicateValues(apps.map((app) => app.key))
  if (duplicateKeys.length) {
    throw new Error(
      `Toolbar keys must be unique: ${[...new Set(duplicateKeys)].join(', ')}`
    )
  }

  const commandIds = apps.map((app) => app.commandId)
  const duplicateCommandIds = duplicateValues(commandIds)
  if (duplicateCommandIds.length) {
    throw new Error(
      `Toolbar commands must be unique: ${[...new Set(duplicateCommandIds)].join(', ')}`
    )
  }

  const registeredCommands = new Set(commandIds)
  const missingContributedCommands = (
    toolbarPackage.contributes?.commands || []
  )
    .map((entry) => entry.command)
    .filter(
      (commandId) =>
        commandId.startsWith('fireuxToolbar.start') &&
        ![
          'fireuxToolbar.startAllServers',
          'fireuxToolbar.startAppByKey',
        ].includes(commandId) &&
        !registeredCommands.has(commandId)
    )

  if (missingContributedCommands.length) {
    throw new Error(
      `Toolbar data must retain contributed command IDs: ${missingContributedCommands.join(', ')}`
    )
  }
}

export async function buildToolbarAppsSource({ repoRoot, registryApps }) {
  const toolbarDirectory = resolve(repoRoot, 'tools/vscode-fireux-toolbar')
  const toolbarAppsPath = resolve(toolbarDirectory, 'apps.js')
  const [presentationSource, toolbarPackageSource] = await Promise.all([
    readFile(resolve(toolbarDirectory, 'apps.presentation.json'), 'utf8'),
    readFile(resolve(toolbarDirectory, 'package.json'), 'utf8'),
  ])
  const presentation = JSON.parse(presentationSource)
  const toolbarPackage = JSON.parse(toolbarPackageSource)
  const contributedCommands = (toolbarPackage.contributes?.commands || []).map(
    (entry) => entry.command
  )

  assertPresentation(presentation, registryApps)

  const orderedApps = [
    ...registryApps.map((app) => ({
      order: presentation.apps[app.key]?.order ?? 10_000 + app.launchOrder,
      app: toolbarAppRecord(
        app,
        presentation.apps[app.key] || {},
        contributedCommands
      ),
    })),
    ...presentation.extras.map((app) => ({
      order: app.order ?? 20_000,
      app: Object.fromEntries(
        Object.entries(app).filter(([key]) => key !== 'order')
      ),
    })),
  ].sort((left, right) => left.order - right.order)

  const apps = orderedApps.map((entry) => entry.app)
  assertToolbarEntries(apps, toolbarPackage)

  const prettierConfig = (await resolveConfig(toolbarAppsPath)) || {}
  return format(
    [
      '// Generated by scripts/sync-dev-workspace.mjs. Do not edit.',
      `const apps = ${JSON.stringify(apps, null, 2)}`,
      '',
      'module.exports = { apps }',
      '',
    ].join('\n'),
    { ...prettierConfig, filepath: toolbarAppsPath }
  )
}
