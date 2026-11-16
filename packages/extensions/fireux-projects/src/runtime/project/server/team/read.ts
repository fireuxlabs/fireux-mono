import type { H3Event } from 'h3'
import { requireProjectOperator } from '../authority'
import { enrichTeamMembers } from 'fireux-core/runtime/workspace/server/team/members'
import { getRuntimeIdentityFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import type { LiveProjectionSources } from 'fireux-core/runtime/server/utils/live-projection-sources'
export async function readProjectTeam(
  event: H3Event,
  projectIdInput: unknown,
  sources?: LiveProjectionSources
) {
  const { projectId, teamRef } = await requireProjectOperator(
    event,
    projectIdInput,
    sources
  )
  const query = teamRef.limit(200)
  sources?.watch(query)
  const team = await query.get()
  const enriched = await enrichTeamMembers(
    team.docs.map((row) => ({ id: row.id, data: row.data() })),
    getRuntimeIdentityFirestore(),
    sources
  )
  const members = enriched
    .map(({ memberId, ...member }) => ({ id: memberId, ...member }))
    .sort((a, b) => a.name.localeCompare(b.name))
  return { ok: true as const, project_id: projectId, members }
}
