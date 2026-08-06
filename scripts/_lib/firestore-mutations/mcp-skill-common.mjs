// @fireux-script
// last_used: 2026-08-05
// usage_note: shared typed-target enforcement for MCP/Skill Firestore mutations.

import { getFirestore } from 'firebase-admin/firestore'

const VERBS = new Set(['create', 'update', 'delete'])

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
