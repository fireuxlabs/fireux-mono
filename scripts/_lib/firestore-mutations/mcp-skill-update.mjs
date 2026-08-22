// @fireux-script
// last_used: 2026-08-05
// usage_note: sole MCP/Skill update touchpoint; scripts and CLI invoke this avenue too.

import {
  materializeMcpSkillValue,
  resolveMcpSkillMutationRef,
} from './mcp-skill-common.mjs'

export async function mcpSkillUpdate(app, target, id, data) {
  await resolveMcpSkillMutationRef(app, target, 'update', id).update(
    materializeMcpSkillValue(data)
  )
}
