import { useRuntimeConfig } from '#imports'
import { AppStorage } from 'fireux-core/runtime/app/models/app.model'
import {
  AppUserStorage,
  UserStorage,
} from 'fireux-core/runtime/user/models/user.model'
import {
  AppProjectStorage,
  ProjectStorage,
} from 'fireux-core/runtime/project/models/project.model'
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
  const appRef = db.collection(AppStorage.collection).doc(appId)
  const [app, membership, targets, project, support] = await Promise.all([
    appRef.get(),
    appRef.collection(AppUserStorage.collection).doc(uid).get(),
    db.doc(`${UserStorage.collection}/${uid}/private/targets`).get(),
    db.collection(ProjectStorage.collection).doc(projectId).get(),
    appRef.collection(AppProjectStorage.collection).doc(projectId).get(),
  ])
  const membershipData = membership.data() || {}
  const projectIds = Array.isArray(targets.data()?.project_ids)
    ? targets.data()?.project_ids.map(text)
    : []
  if (
    !app.exists ||
    text(membershipData.role) !== 'admin' ||
    !projectIds.includes(projectId)
  ) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Project administrator access is required.',
    })
  }
  if (!project.exists || !support.exists) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Project access data was not found.',
    })
  }

  const supportData = support.data() || {}
  const operators = new Set(
    Array.isArray(supportData.operator_ids)
      ? supportData.operator_ids.map(text).filter(Boolean)
      : []
  )
  const team = new Set(
    Array.isArray(supportData.team_ids)
      ? supportData.team_ids.map(text).filter(Boolean)
      : []
  )
  const memberIds = [...new Set([...operators, ...team])].filter(
    (id) => !id.includes('/')
  )
  const users = memberIds.length
    ? await db.getAll(
        ...memberIds.map((id) => db.collection(UserStorage.collection).doc(id))
      )
    : []
  const members = users
    .filter((user) => user.exists)
    .map((user) => {
      const data = user.data() || {}
      return {
        id: user.id,
        handle: text(data.handle),
        display_name: text(data.display_name),
        avatar: text(data.avatar),
        access: operators.has(user.id)
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
