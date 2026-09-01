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
  const memberById = new Map(
    linkedRecords.map((member) => [member.userId, member])
  )
  const linkedMembers = users
    .filter((user) => user.exists)
    .map((user) => {
      const data = user.data() || {}
      const role = memberById.get(user.id)?.role
      return {
        id: memberById.get(user.id)?.id || user.id,
        userId: user.id,
        name: text(data.display_name) || text(data.handle) || user.id,
        avatar: text(data.avatar),
        role:
          role === 'owner' || role === 'operator' ? role : ('member' as const),
        status: 'active' as const,
      }
    })
  const unlinkedMembers = memberRecords
    .filter((member) => !member.userId)
    .map((member) => ({
      id: member.id,
      userId: '',
      name: member.name || member.id,
      avatar: member.avatar,
      role:
        member.role === 'owner' || member.role === 'operator'
          ? member.role
          : ('member' as const),
      status: 'active' as const,
    }))
  const members = [...linkedMembers, ...unlinkedMembers].sort((left, right) =>
    left.name.localeCompare(right.name)
  )

  return { ok: true as const, project_id: projectId, members }
}
