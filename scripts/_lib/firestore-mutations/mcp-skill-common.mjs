// @fireux-script
// last_used: 2026-08-05
// usage_note: shared typed-target enforcement for MCP/Skill Firestore mutations.

import { getFirestore, Timestamp } from 'firebase-admin/firestore'

const VERBS = new Set(['create', 'update', 'delete'])

export function materializeMcpSkillValue(value) {
  if (Array.isArray(value)) return value.map(materializeMcpSkillValue)
  if (!value || typeof value !== 'object' || value instanceof Timestamp)
    return value
  const prototype = Object.getPrototypeOf(value)
  if (prototype !== Object.prototype && prototype !== null) return value
  const keys = Object.keys(value)
  if (keys.length === 1 && keys[0] === '__timestamp') {
    const iso = value.__timestamp
    const date = typeof iso === 'string' ? new Date(iso) : null
    if (!date || Number.isNaN(date.valueOf()) || date.toISOString() !== iso) {
      throw new Error('MCP/Skill timestamp tag must contain an exact ISO timestamp.')
    }
    return Timestamp.fromDate(date)
  }
  return Object.fromEntries(
    Object.entries(value).map(([key, child]) => [
      key,
      materializeMcpSkillValue(child),
    ])
  )
}

export function resolveMcpSkillMutationRef(app, target, verb, id) {
  if (
    !VERBS.has(verb) ||
    target?.lane !== 'mcp-skill' ||
    !target?.verbs?.includes(verb)
  ) {
    throw new Error(
      `Firestore mutation target ${target?.key || '<unknown>'} does not authorize mcp-skill:${verb}.`
    )
  }
  if (!target.collectionPath || typeof target.collectionPath !== 'string') {
    throw new Error('MCP/Skill mutation requires a typed authority target.')
  }
  const database =
    target.database?.kind === 'default'
      ? getFirestore(app)
      : getFirestore(app, target.database?.databaseId)
  return database.collection(target.collectionPath).doc(id)
}
