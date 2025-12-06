#!/usr/bin/env node
/**
 * Push a local registry.json into the FireUX hello endpoint.
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

function buildRequestPayload(payload) {
  if (!payload.type) {
    throw new Error('Registry entry must include a "type" field.')
  }

  const name = payload.title || payload.name || payload.id
  if (!name) {
    throw new Error(
      'Registry entry needs at least a "title" or "id" to derive a name.'
    )
  }

  return {
    type: payload.type,
    id: payload.id,
    name,
    data: payload,
  }
}

function resolveEndpoint() {
  return (
    process.env.FIREUX_REGISTRY_ENDPOINT || 'http://localhost:3000/api/hello'
  )
}

async function postToHello(body) {
  const endpoint = resolveEndpoint()
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(
      `Hello endpoint ${endpoint} responded ${response.status}: ${text}`
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
  const result = await postToHello(requestBody)

  console.log(
    `✅ Synced via hello endpoint (id: ${result?.id ?? 'unknown'}) path: ${
      result?.path ?? 'n/a'
    }`
  )
}

main().catch((error) => {
  console.error('❌ registry:register failed')
  console.error(error.message)
  process.exit(1)
})
