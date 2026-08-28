import { useRuntimeConfig } from '#imports'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { createError, type H3Event } from 'h3'
import { getFirestoreDb } from '../../utils/firebase-admin'

const text = (value: unknown) => String(value ?? '').trim()

export async function readProjectTeam(event: H3Event, projectIdInput: unknown) {
  const { uid } = await requireFirebaseBearerUser(event)
  const projectId = requireFirestoreDocumentId(projectIdInput, 'Project id')
  const appId = requireFirestoreDocumentId(
    useRuntimeConfig().public?.fireux?.id,
    'FireUX App id'
  )
  const db = await getFirestoreDb()
  const appRef = db.collection('apps').doc(appId)
  const projectRef = db.collection('projects').doc(projectId)
  const teamRef = projectRef.collection('team')
  const [app, membership, project, currentTeamMember] = await Promise.all([
    appRef.get(),
    appRef.collection('users').doc(uid).get(),
    projectRef.get(),
    teamRef.doc(uid).get(),
  ])
  const teamRole = text(currentTeamMember.data()?.role)
  if (
    !app.exists ||
    (text(membership.data()?.role) !== 'admin' &&
      text(membership.data()?.role) !== 'user') ||
    !currentTeamMember.exists ||
    text(currentTeamMember.data()?.user_id) !== uid ||
    text(currentTeamMember.data()?.status) !== 'active' ||
    (teamRole !== 'owner' && teamRole !== 'operator')
  ) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Active Project Team authority is required.',
    })
  }
  if (!project.exists) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Project was not found.',
    })
  }

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
