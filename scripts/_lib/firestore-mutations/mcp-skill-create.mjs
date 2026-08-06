// @fireux-script
// last_used: 2026-08-05
// usage_note: sole MCP/Skill create touchpoint; scripts and CLI invoke this avenue too.

import { resolveMcpSkillMutationRef } from './mcp-skill-common.mjs'

export async function mcpSkillCreate(app, target, id, data) {
  const payload = { ...data }
  delete payload.id
  await resolveMcpSkillMutationRef(app, target, 'create', id).create(payload)
}
