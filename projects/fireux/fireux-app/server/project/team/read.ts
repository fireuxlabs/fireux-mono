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
      name: text(member.data().name),
      avatar: text(member.data().avatar),
      role: text(member.data().role),
      userId: text(member.data().user_id),
      status: text(member.data().status),
    }))
    .filter(
      (member) =>
        member.status === 'active' &&
        !member.id.includes('/') &&
        !member.userId.includes('/')
    )
  const linkedRecords = memberRecords.filter((member) => member.userId)
  const users = linkedRecords.length
    ? await db.getAll(
        ...linkedRecords.map((member) =>
          db.collection('users').doc(member.userId)
        )
      )
    : []
  const usersById = new Map(
    users.filter((user) => user.exists).map((user) => [user.id, user.data() || {}])
  )
  const members = memberRecords
    .map((member) => {
      const user = usersById.get(member.userId)
      return {
        id: member.id,
        userId: user ? member.userId : '',
        name: member.name || 'Missing Team name',
        avatar: user ? text(user.avatar) : member.avatar,
        role:
          member.role === 'owner' || member.role === 'operator'
            ? member.role
            : ('member' as const),
        status: 'active' as const,
      }
    })
    .sort((left, right) => left.name.localeCompare(right.name))

  return { ok: true as const, project_id: projectId, members }
}
