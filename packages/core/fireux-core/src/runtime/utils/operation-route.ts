// Concurrent edit — 2026-07-21 13:05 CEST — Operation detail surfaces: derive stable public paths from capability records.
import type { FireuxMetaOperation } from '../models/system/meta-content.model'

export function getFireuxOperationRouteKey(operation: FireuxMetaOperation): string {
  const consolePrefix = `${operation.console.id}.`

  return operation.id.startsWith(consolePrefix)
    ? operation.id.slice(consolePrefix.length)
    : operation.id
}

export function getFireuxOperationPublicPath(operation: FireuxMetaOperation): string {
  return [
    '/operations',
    encodeURIComponent(operation.console.id),
    encodeURIComponent(getFireuxOperationRouteKey(operation)),
  ].join('/')
}
