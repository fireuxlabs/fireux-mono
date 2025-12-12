#!/usr/bin/env node
/**
 * Push a local registry.json into the FireUX registry endpoint.
 * Usage: pnpm registry:register <path/to/registry.json>
 */
import { promises as fs } from 'node:fs'
import path from 'node:path'
import process from 'node:process'

function resolveTargetPath(input) {
  if (!input) {
    throw new Error(
      'Missing registry file. Usage: pnpm registry:register <path>'
    )
  }
  return path.isAbsolute(input) ? input : path.resolve(process.cwd(), input)
}

async function readRegistryFile(filePath) {
  try {
    const raw = await fs.readFile(filePath, 'utf8')
    return JSON.parse(raw)
  } catch (error) {
    throw new Error(
      `Unable to read registry file at ${filePath}: ${error.message}`
    )
  }
}

function buildRequestPayload(registryEntry) {
  if (!registryEntry.type) {
    throw new Error('Registry entry must include a "type" field.')
  }

  return {
    type: registryEntry.type,
    payload: registryEntry,
  }
}

function resolveEndpoint() {
  return (
    process.env.FIREUX_REGISTRY_ENDPOINT
  )
}

async function postToRegistry(body) {
  const endpoint = resolveEndpoint()
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(
      `Registry endpoint ${endpoint} responded ${response.status}: ${text}`
    )
  }

  return response.json()
}

async function main() {
  const args = process.argv.slice(2)
  const targetPath = resolveTargetPath(args[0])

  console.log(`📦 Loading ${targetPath}`)
  const payload = await readRegistryFile(targetPath)
  const requestBody = buildRequestPayload(payload)
  const result = await postToRegistry(requestBody)

  console.log(
    `✅ Synced via registry endpoint (id: ${result?.id ?? 'unknown'}) path: ${
      result?.path ?? 'n/a'
    }`
  )
}

main().catch((error) => {
  console.error('❌ registry:register failed')
  console.error(error.message)
  process.exit(1)
})
