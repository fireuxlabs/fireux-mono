import { defineEventHandler, setResponseHeaders, type H3Event } from 'h3'
import {
  UserAccountStorage, type CurrentUserAccountResponse, type UserAccount, } from '../../../../user/models/user-account.model.ts'
import { requireFirebaseBearerUser } from '../../../utils/auth/bearer'
import { getRuntimeIdentityFirestore } from '../../../utils/getRuntimeFirestore'

export default defineEventHandler(async (event: H3Event) => {
  const { uid } = await requireFirebaseBearerUser(event)
  const snapshot = await getRuntimeIdentityFirestore()
    .collection('users')
    .doc(uid)
    .collection(UserAccountStorage.collection)
    .doc(UserAccountStorage.document)
    .get()

  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'private, no-store',
  })

  const response: CurrentUserAccountResponse = {
    ok: true,
    account: snapshot.exists
      ? ({ id: uid, ...(snapshot.data() || {}) } as UserAccount)
      : null,
  }
  return response
})
