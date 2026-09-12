import { createError, defineEventHandler, readBody } from 'h3'
import { FIRESTORE_MUTATION_TARGETS } from '../../../../utils/firestore-mutations/targets'
import { requireFirebaseBearerUser } from '../../../utils/auth/bearer'
import { runGuardedServerTransaction } from '../../../utils/firestore-mutations/server-transaction'
import { readUserProfileChanges } from '../../../../user/utils/profile-validation'

function readChange(body: unknown): Record<string, string> {
  try {
    return readUserProfileChanges(body)
  } catch (error) {
    throw createError({
      statusCode: 400,
      statusMessage: (error as Error).message,
    })
  }
}

export default defineEventHandler(async (event) => {
  const { uid } = await requireFirebaseBearerUser(event)
  const change = readChange(await readBody(event))
  const users = FIRESTORE_MUTATION_TARGETS.users

  await runGuardedServerTransaction(users.database, async (mutations) => {
    const user = await mutations.read(users, uid)
    if (!user.exists) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Create the User before updating the profile.',
      })
    }
    mutations.update(users, uid, change)
  })

  return { ok: true, change }
})
