import { type H3Event } from 'h3'
import { requireProjectOperator } from '../core/authority'

const text = (value: unknown) => String(value ?? '').trim()

export async function readProjectTeam(event: H3Event, projectIdInput: unknown) {
  const { projectId, db, teamRef } = await requireProjectOperator(
    event,
    projectIdInput
  )

  const team = await teamRef.limit(150).get()
  const memberRecords = team.docs
    .map((member) => ({
      id: member.id,
      role: text(member.data().role),
      userId: text(member.data().user_id),
      status: text(member.data().status),
    }))
    .filter(
      (member) =>
        member.id === member.userId &&
        member.status === 'active' &&
        !member.userId.includes('/')
    )
  const users = memberRecords.length
    ? await db.getAll(
        ...memberRecords.map((member) =>
          db.collection('users').doc(member.userId)
        )
      )
    : []
  const memberById = new Map(
    memberRecords.map((member) => [member.userId, member])
  )
  const members = users
    .filter((user) => user.exists)
    .map((user) => {
      const data = user.data() || {}
      const role = memberById.get(user.id)?.role
      return {
        id: user.id,
        handle: text(data.handle),
        display_name: text(data.display_name),
        avatar: text(data.avatar),
        access:
          role === 'owner' || role === 'operator'
            ? ('operator' as const)
            : ('team' as const),
      }
    })
    .sort((left, right) =>
      (left.display_name || left.handle || left.id).localeCompare(
        right.display_name || right.handle || right.id
      )
    )

  return { ok: true as const, project_id: projectId, members }
}
