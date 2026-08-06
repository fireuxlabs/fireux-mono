// @fireux-script
// last_used: 2026-08-05
// usage_note: sole MCP/Skill delete touchpoint; scripts and CLI invoke this avenue too.

import { resolveMcpSkillMutationRef } from './mcp-skill-common.mjs'

export async function mcpSkillDelete(app, target, id) {
  await resolveMcpSkillMutationRef(app, target, 'delete', id).delete()
}
