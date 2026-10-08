import type { H3Event } from 'h3'
import { requireProjectOperator } from '../authority'
import { enrichTeamMembers } from 'fireux-core/runtime/server/utils/workspace-team/members'
import { getRuntimeIdentityFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
export async function readProjectTeam(event: H3Event, projectIdInput: unknown) {
  const { projectId, teamRef } = await requireProjectOperator(
    event,
    projectIdInput
  )
  const team = await teamRef.limit(200).get()
  const enriched = await enrichTeamMembers(
    team.docs.map((row) => ({ id: row.id, data: row.data() })),
    getRuntimeIdentityFirestore()
  )
  const members = enriched
    .map(({ memberId, ...member }) => ({ id: memberId, ...member }))
    .sort((a, b) => a.name.localeCompare(b.name))
  return { ok: true as const, project_id: projectId, members }
}
