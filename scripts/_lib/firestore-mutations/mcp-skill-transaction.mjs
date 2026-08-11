// @fireux-script
// last_used: 2026-08-11
// usage_note: sole MCP/Skill atomic set touchpoint for preimage-backed operational migrations.

import { getFirestore } from 'firebase-admin/firestore'
import { resolveMcpSkillMutationRef } from './mcp-skill-common.mjs'

export async function mcpSkillAtomicSet(app, writes, validate) {
  if (!Array.isArray(writes) || !writes.length) {
    throw new Error('MCP/Skill atomic set requires at least one write.')
  }
  const databaseIds = new Set(writes.map(write =>
    write.target?.database?.kind === 'default'
      ? '(default)'
      : write.target?.database?.databaseId
  ))
  if (databaseIds.size !== 1) {
    throw new Error('MCP/Skill atomic set cannot span Firestore databases.')
  }
  const databaseId = [...databaseIds][0]
  const db = databaseId === '(default)'
    ? getFirestore(app)
    : getFirestore(app, databaseId)
  const resolved = writes.map(write => ({
    ...write,
    ref: resolveMcpSkillMutationRef(
      app,
      write.target,
      'update',
      write.id
    ),
  }))

  await db.runTransaction(async transaction => {
    const snapshots = await transaction.getAll(...resolved.map(write => write.ref))
    await validate?.(snapshots)
    for (const write of resolved) transaction.set(write.ref, write.data)
  })
}
