#!/usr/bin/env node
// @fireux-script
// last_used: 2026-07-20
// usage_note: resolve the 13 known directory blockers into a deterministic disabled local remediation plan.
// Concurrent edit — 2026-07-19 22:12 CEST — Directory Remediation Pass: add the strict no-write remediation planner command.
// Concurrent edit — 2026-07-20 11:26 CEST — Directory Live Provisioning Pass: refresh locked live-write review input.

import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { buildPlatformDirectoryRemediationPlan } from './_lib/platform-directory-remediation.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..')

function parseStrictArgs(argv) {
  const valueOptions = new Set(['report', 'out', 'format'])
  const flagOptions = new Set(['help'])
  const parsed = {}

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index]
    if (!token.startsWith('--')) {
      throw new Error(`Unexpected positional argument: ${token}`)
    }

    const separator = token.indexOf('=')
    const key = token.slice(2, separator === -1 ? undefined : separator)
    const inlineValue = separator === -1 ? undefined : token.slice(separator + 1)

    if (flagOptions.has(key)) {
      if (inlineValue !== undefined) {
        throw new Error(`Option --${key} does not accept a value.`)
      }
      if (key in parsed) throw new Error(`Duplicate option: --${key}`)
      parsed[key] = true
      continue
    }

    if (!valueOptions.has(key)) {
      throw new Error(`Unknown option: --${key || '(empty)'}`)
    }
    if (key in parsed) throw new Error(`Duplicate option: --${key}`)

    const value = inlineValue === undefined ? argv[index + 1] : inlineValue
    if (!value || value.startsWith('--')) {
      throw new Error(`Option --${key} requires a value.`)
    }
    parsed[key] = value
    if (inlineValue === undefined) index += 1
  }

  return parsed
}

function resolveRepoPath(value, fallback, label) {
  const resolved = path.resolve(repoRoot, String(value || fallback).trim())
  const relative = path.relative(repoRoot, resolved)
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`${label} must be a file below the repository root.`)
  }
  if (!resolved.endsWith('.json')) {
    throw new Error(`${label} must be a JSON file.`)
  }
  return resolved
}

function printUsage() {
  console.log(`Usage:
  node scripts/plan-platform-directory-remediation.mjs [--report <path>] [--out <path>] [--format summary|json]

Defaults:
  --report temp/platform-directory-reconciliation.json
  --out    temp/platform-directory-remediation.json

This command only reads a saved reconciliation report and writes a disabled
local plan. It has no remote imports, reads, writes, apply, or commit mode.
All unlisted options are rejected.`)
}

async function main() {
  const args = parseStrictArgs(process.argv.slice(2))
  if (args.help) {
    printUsage()
    return
  }

  const format = String(args.format || 'summary').trim()
  if (!['summary', 'json'].includes(format)) {
    throw new Error('--format must be summary or json.')
  }

  const reportPath = resolveRepoPath(
    args.report,
    'temp/platform-directory-reconciliation.json',
    'Report path'
  )
  const outputPath = resolveRepoPath(
    args.out,
    'temp/platform-directory-remediation.json',
    'Output path'
  )
  if (reportPath === outputPath) {
    throw new Error('Output path must not overwrite the reconciliation report.')
  }

  const reportSource = await readFile(reportPath, 'utf8')
  let report
  try {
    report = JSON.parse(reportSource)
  } catch {
    throw new Error('Reconciliation report is not valid JSON.')
  }

  const sourceReportHash = createHash('sha256')
    .update(reportSource)
    .digest('hex')
  const plan = buildPlatformDirectoryRemediationPlan(report, {
    generatedAt: new Date().toISOString(),
    sourceReportHash,
  })

  await mkdir(path.dirname(outputPath), { recursive: true })
  await writeFile(outputPath, `${JSON.stringify(plan, null, 2)}\n`, 'utf8')

  if (format === 'json') {
    console.log(JSON.stringify(plan, null, 2))
    return
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        mode: plan.mode,
        enabled: plan.enabled,
        remoteWrites: plan.remoteWrites,
        executionReady: plan.executionReady,
        output: path.relative(repoRoot, outputPath),
        summary: plan.summary,
      },
      null,
      2
    )
  )
}

main().catch((error) => {
  console.error(
    `[directory-remediation-plan] ${
      error instanceof Error ? error.message : String(error)
    }`
  )
  process.exitCode = 1
})
