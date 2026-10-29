import {
  createError,
  defineEventHandler,
  getQuery,
  setResponseHeader,
} from 'h3'
import { useFireUXConfig } from '../../../../../app/composables/config/FireUXConfig'
import { requireAdmin } from '../../../../../app/server/app-user/command-contract'
import { requireFirebaseBearerUser } from '../../../../utils/auth/bearer'
import {
  getRuntimeFirestore,
  getRuntimeIdentityFirestore,
} from '../../../../utils/getRuntimeFirestore'
import { requireFirestoreDocumentId } from '../../../../utils/ids/path'
import { normalizeUserHandle } from '../../../../../user/utils/user-handle'
import { readUserIdentitySummary } from '../../../../../user/server/identity/summary'

/** App administrators can resolve a person before that person joins this App. */
export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'private, no-store')
  const appId = requireFirestoreDocumentId(
    useFireUXConfig(event).appId,
    'App id'
  )
  const { uid } = await requireFirebaseBearerUser(event)
  const member = await getRuntimeFirestore()
    .doc(`apps/${appId}/users/${uid}`)
    .get()
  requireAdmin(member.data())
  const handle = normalizeUserHandle(
    String(getQuery(event).handle || '').replace(/^@/, '')
  )
  if (!handle)
    throw createError({
      statusCode: 400,
      statusMessage: 'User handle is invalid.',
    })
  const matches = await getRuntimeIdentityFirestore()
    .collection('users')
    .where('handle', '==', handle)
    .limit(2)
    .get()
  if (matches.docs.length > 1)
    throw createError({
      statusCode: 409,
      statusMessage: 'User identity is not unique.',
    })
  const user = matches.docs[0] ? readUserIdentitySummary(matches.docs[0]) : null
  return user
})
