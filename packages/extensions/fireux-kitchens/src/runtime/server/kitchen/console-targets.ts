// Concurrent edit — 2026-07-22 12:41 CEST — Kitchen palette console: share fixed-runtime target bounds between reads and trusted writes.
import { useRuntimeConfig } from '#imports'
import { createError, type H3Event } from 'h3'
import { isFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path.ts'
import { KITCHEN_CONSOLE_TARGET_LIMIT } from '../../models/kitchen/kitchen-index.model.ts'

type StoredRecord = Record<string, unknown>

const text = (value: unknown) => String(value ?? '').trim()
const record = (value: unknown): StoredRecord =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as StoredRecord
    : {}

function conflict(statusMessage: string): never {
  throw createError({ statusCode: 409, statusMessage })
}

function storedIds(value: unknown, label: string) {
  if (!Array.isArray(value) || value.length > KITCHEN_CONSOLE_TARGET_LIMIT) {
    conflict(`${label} has an invalid stored shape.`)
  }

  const ids = value.map(text)
  if (
    ids.some(id => !isFirestoreDocumentId(id)) ||
    new Set(ids).size !== ids.length
  ) {
    conflict(`${label} contains invalid stored ids.`)
  }
  return ids
}

export function resolveRuntimeKitchenTargetIds(
  event: H3Event,
  membership: StoredRecord
) {
  const runtime = useRuntimeConfig(event)
  const fireux = record(record(runtime.public).fireux)
  const kitchenConfig = record(
    record(record(fireux.consoleConfig).kitchen)
  )
  const configured = text(fireux.role) === 'tenant'
    ? storedIds(
        kitchenConfig.targetIds ?? [],
        'Configured Kitchen console targets'
      )
    : storedIds(
        record(membership.console_targets).kitchen_ids ?? [],
        'UserApp Kitchen console targets'
      )
  const development = import.meta.dev
    ? storedIds(
        kitchenConfig.devTargetIds ?? [],
        'Development Kitchen console targets'
      )
    : []
  const ids = [...new Set([...configured, ...development])]

  if (ids.length > KITCHEN_CONSOLE_TARGET_LIMIT) {
    conflict('Kitchen console targets exceed the supported limit.')
  }
  return ids
}
