import { defineEventHandler, setResponseHeaders, type H3Event } from 'h3'
import {
  UserContextStorage, type CurrentUserContextResponse, type UserContext, } from '../../../../user/models/user-context.model.ts'
import { requireFirebaseBearerUser } from '../../../utils/auth/bearer'
import { getRuntimeIdentityFirestore } from '../../../utils/getRuntimeFirestore'

export default defineEventHandler(async (event: H3Event) => {
  const { uid } = await requireFirebaseBearerUser(event)
  const snapshot = await getRuntimeIdentityFirestore()
    .collection('users')
    .doc(uid)
    .collection(UserContextStorage.collection)
    .doc(UserContextStorage.document)
    .get()

  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'private, no-store',
  })

  const response: CurrentUserContextResponse = {
    ok: true,
    context: typeof snapshot.data()?.context === 'string' ? snapshot.data()!.context : '',
    userContext: snapshot.exists
      ? ({ id: uid, ...(snapshot.data() || {}) } as UserContext)
      : null,
  }
  return response
})
