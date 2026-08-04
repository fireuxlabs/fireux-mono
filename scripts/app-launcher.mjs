#!/usr/bin/env node
// @fireux-script
// last_used: 2026-08-04
// usage_note: interactive local App launcher backed by the canonical App registry.

import { spawn } from 'node:child_process'
import net from 'node:net'
import process from 'node:process'
import readline from 'node:readline'
import { fileURLToPath } from 'node:url'

import { getAppRegistryEntries } from './_lib/app-registry.mjs'

const repoRoot = fileURLToPath(new URL('..', import.meta.url))
const allApps = getAppRegistryEntries().sort(
  (left, right) =>
    (left.launchOrder ?? Number.MAX_SAFE_INTEGER) -
      (right.launchOrder ?? Number.MAX_SAFE_INTEGER) ||
    left.name.localeCompare(right.name)
)

const ecosystemMap = new Map()
for (const app of allApps) {
  const group = ecosystemMap.get(app.ecosystem) ?? []
  group.push(app)
  ecosystemMap.set(app.ecosystem, group)
}

const ecosystems = [...ecosystemMap.entries()]
  .map(([key, groupApps]) => {
    const mainApp =
      groupApps.find((app) => app.key === key) ??
      groupApps.find((app) => app.role === 'global') ??
      groupApps[0]
    const apps = [...groupApps].sort(
      (left, right) =>
        Number(right.key === mainApp.key) - Number(left.key === mainApp.key) ||
        (left.launchOrder ?? Number.MAX_SAFE_INTEGER) -
          (right.launchOrder ?? Number.MAX_SAFE_INTEGER) ||
        left.name.localeCompare(right.name)
    )

    return { apps, key, mainApp, name: mainApp.name }
  })
  .sort(
    (left, right) =>
      (left.mainApp.launchOrder ?? Number.MAX_SAFE_INTEGER) -
        (right.mainApp.launchOrder ?? Number.MAX_SAFE_INTEGER) ||
      left.name.localeCompare(right.name)
  )
const launcherRows = ecosystems.flatMap((ecosystem) =>
  ecosystem.apps.map((app) => ({ app, ecosystem }))
)
const mainRowIndexes = launcherRows
  .map(({ app, ecosystem }, index) =>
    app.key === ecosystem.mainApp.key ? index : -1
  )
  .filter((index) => index >= 0)

const ansi = {
  bold: '\u001B[1m',
  clear: '\u001B[2J\u001B[H',
  cyan: '\u001B[36m',
  dim: '\u001B[2m',
  green: '\u001B[32m',
  hideCursor: '\u001B[?25l',
  red: '\u001B[31m',
  reset: '\u001B[0m',
  restoreScreen: '\u001B[?1049l',
  saveScreen: '\u001B[?1049h',
  showCursor: '\u001B[?25h',
  yellow: '\u001B[33m',
}

const statuses = new Map(allApps.map((app) => [app.key, 'checking']))
const starting = new Set()
let selectedIndex = 0
let statusMessage = 'Checking local servers...'
let statusRefreshRunning = false
let stopped = false

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

function isPortOpen(port, timeoutMs = 350) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host: '127.0.0.1', port })
    let settled = false

    const finish = (isOpen) => {
      if (settled) return
      settled = true
      socket.destroy()
      resolve(isOpen)
    }

    socket.setTimeout(timeoutMs)
    socket.once('connect', () => finish(true))
    socket.once('timeout', () => finish(false))
    socket.once('error', () => finish(false))
  })
}

function plainLength(value) {
  return String(value).replace(/\u001B\[[0-9;]*m/g, '').length
}

function fit(value, width) {
  const raw = String(value)
  const visibleLength = plainLength(raw)
  if (visibleLength >= width) return raw
  return `${raw}${' '.repeat(width - visibleLength)}`
}

function statusLabel(status) {
  if (status === 'running') return 'RUNNING'
  if (status === 'starting') return 'STARTING'
  if (status === 'failed') return 'FAILED'
  if (status === 'checking') return 'CHECKING'
  return 'STOPPED'
}

function colorStatus(status) {
  const label = statusLabel(status)
  if (status === 'running') return `${ansi.green}${label}${ansi.reset}`
  if (status === 'starting') return `${ansi.yellow}${label}${ansi.reset}`
  if (status === 'failed') return `${ansi.red}${label}${ansi.reset}`
  if (status === 'checking') return `${ansi.yellow}${label}${ansi.reset}`
  return `${ansi.dim}${label}${ansi.reset}`
}

function appKind(app, ecosystem) {
  if (app.key === ecosystem.mainApp.key) return 'MAIN'
  if (app.role === 'tenant') return 'TENANT'
  if (app.role === 'standalone') return 'TOOL'
  return 'APP'
}

function appLine(app, ecosystem, index, width, selected) {
  const isMain = app.key === ecosystem.mainApp.key
  const number = index < 9 ? `${index + 1}` : ' '
  const branch = isMain ? '' : '|-- '
  const marker = selected ? '>' : ' '
  const rawLeft = `${marker} ${number}  ${branch}${app.name} [${appKind(app, ecosystem)}]`
  const status = statuses.get(app.key)
  const rawRight = `${statusLabel(status)}  :${app.port}`
  const maxLeftWidth = Math.max(12, width - rawRight.length - 3)
  const left =
    rawLeft.length > maxLeftWidth
      ? `${rawLeft.slice(0, maxLeftWidth - 1)}~`
      : rawLeft
  const leader = '.'.repeat(Math.max(1, width - left.length - rawRight.length))
  const leftColor = isMain
    ? `${ansi.bold}${ansi.cyan}`
    : selected
      ? ansi.cyan
      : ''

  return `${leftColor}${left}${ansi.reset}${ansi.dim}${leader}${ansi.reset}${colorStatus(status)}  ${ansi.dim}:${app.port}${ansi.reset}`
}

function render() {
  if (stopped) return

  const width = Math.max(52, (process.stdout.columns || 100) - 1)
  const output = [
    `${ansi.clear}${fit(
      `${ansi.cyan}${ansi.bold}FireUX App Launcher${ansi.reset}  ${ansi.dim}${statusMessage}${ansi.reset}`,
      width
    )}`,
  ]

  for (const [index, { app, ecosystem }] of launcherRows.entries()) {
    output.push(appLine(app, ecosystem, index, width, index === selectedIndex))
  }

  output.push(
    `${ansi.dim}Up/Down: App   Left/Right: ecosystem   Enter: start/open   1-9: quick open   R: refresh   Q: quit${ansi.reset}`
  )

  process.stdout.write(output.join('\n'))
}

async function refreshStatuses() {
  if (statusRefreshRunning || stopped) return
  statusRefreshRunning = true

  try {
    const results = await Promise.all(
      allApps.map(async (app) => [app.key, await isPortOpen(app.port)])
    )

    for (const [key, running] of results) {
      if (running) {
        statuses.set(key, 'running')
        starting.delete(key)
      } else if (!starting.has(key) && statuses.get(key) !== 'failed') {
        statuses.set(key, 'stopped')
      }
    }

    if (statusMessage === 'Checking local servers...') {
      const runningCount = results.filter(([, running]) => running).length
      statusMessage = `${runningCount} running. Select an App and press Enter.`
    }
  } finally {
    statusRefreshRunning = false
    render()
  }
}

function openBrowser(app) {
  const command =
    process.platform === 'darwin'
      ? 'open'
      : process.platform === 'win32'
        ? 'cmd'
        : 'xdg-open'
  const args =
    process.platform === 'win32'
      ? ['/c', 'start', '', app.baseUrl]
      : [app.baseUrl]
  const browser = spawn(command, args, { detached: true, stdio: 'ignore' })
  browser.unref()
  statusMessage = `Opened ${app.name} at ${app.baseUrl}`
  render()
}

async function startAndOpen(app) {
  if (starting.has(app.key)) {
    statusMessage = `${app.name} is still starting...`
    render()
    return
  }

  if (await isPortOpen(app.port)) {
    statuses.set(app.key, 'running')
    openBrowser(app)
    return
  }

  starting.add(app.key)
  statuses.set(app.key, 'starting')
  statusMessage = `Starting ${app.name} on port ${app.port}...`
  render()

  const child = spawn('pnpm', [`dev:${app.key}`], {
    cwd: repoRoot,
    detached: true,
    stdio: 'ignore',
  })
  child.unref()

  let spawnError = null
  child.once('error', (error) => {
    spawnError = error
  })

  const deadline = Date.now() + 120_000
  while (!stopped && Date.now() < deadline) {
    if (await isPortOpen(app.port)) {
      starting.delete(app.key)
      statuses.set(app.key, 'running')
      openBrowser(app)
      return
    }

    if (spawnError || (child.exitCode !== null && child.exitCode !== 0)) {
      break
    }

    await sleep(500)
  }

  starting.delete(app.key)
  statuses.set(app.key, 'failed')
  statusMessage = spawnError
    ? `Could not start ${app.name}: ${spawnError.message}`
    : `${app.name} did not become ready. Run pnpm dev:${app.key} to inspect its output.`
  render()
}

function moveSelection(delta) {
  selectedIndex = Math.max(
    0,
    Math.min(launcherRows.length - 1, selectedIndex + delta)
  )
  statusMessage = `${launcherRows[selectedIndex].app.name} selected.`
  render()
}

function moveToEcosystem(delta) {
  const currentMainPosition = mainRowIndexes.findLastIndex(
    (index) => index <= selectedIndex
  )
  const nextMainPosition = Math.max(
    0,
    Math.min(mainRowIndexes.length - 1, currentMainPosition + delta)
  )
  selectedIndex = mainRowIndexes[nextMainPosition]
  statusMessage = `${launcherRows[selectedIndex].ecosystem.name} ecosystem selected.`
  render()
}

function cleanup(exitCode = 0) {
  if (stopped) return
  stopped = true
  clearInterval(statusTimer)
  process.stdout.write(`${ansi.showCursor}${ansi.restoreScreen}${ansi.reset}`)
  if (process.stdin.isTTY) process.stdin.setRawMode(false)
  process.exit(exitCode)
}

if (!process.stdin.isTTY || !process.stdout.isTTY) {
  console.error('[launcher] Run pnpm launcher in an interactive terminal.')
  process.exit(1)
}

readline.emitKeypressEvents(process.stdin)
process.stdin.setRawMode(true)
process.stdin.resume()
process.stdout.write(`${ansi.saveScreen}${ansi.hideCursor}`)

process.stdin.on('keypress', (value, key) => {
  if (key.ctrl && key.name === 'c') cleanup()
  else if (key.name === 'q' || key.name === 'escape') cleanup()
  else if (key.name === 'left' || key.name === 'h') moveToEcosystem(-1)
  else if (key.name === 'right' || key.name === 'l') moveToEcosystem(1)
  else if (key.name === 'up' || key.name === 'k') moveSelection(-1)
  else if (key.name === 'down' || key.name === 'j') moveSelection(1)
  else if (key.name === 'return')
    void startAndOpen(launcherRows[selectedIndex].app)
  else if (key.name === 'r') {
    statusMessage = 'Refreshing server status...'
    void refreshStatuses()
  } else if (/^[1-9]$/.test(value)) {
    const quickIndex = Number(value) - 1
    if (quickIndex < launcherRows.length) {
      selectedIndex = quickIndex
      render()
      void startAndOpen(launcherRows[selectedIndex].app)
    }
  }
})

process.stdout.on('resize', render)
process.once('SIGTERM', () => cleanup(143))
process.once('SIGHUP', () => cleanup(129))

const statusTimer = setInterval(() => void refreshStatuses(), 2_500)
render()
void refreshStatuses()
