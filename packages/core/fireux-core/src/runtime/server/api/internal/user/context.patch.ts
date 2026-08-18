import { FieldValue } from 'firebase-admin/firestore'
import { createError, defineEventHandler, readBody } from 'h3'
import {
  USER_CONTEXT_MAX_LENGTH,
  UserContextStorage,
  type UpdateCurrentUserContextResponse,
} from '../../../../user/models/user-context.model.ts'
import {
  FIRESTORE_MUTATION_TARGETS,
  serverUserContextTarget,
} from '../../../../utils/firestore-mutations/targets'
import { requireFirebaseBearerUser } from '../../../utils/auth/bearer'
import { runGuardedServerTransaction } from '../../../utils/firestore-mutations/server-transaction'

function readContext(body: unknown): string {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'User context payload must be an object.',
    })
  }
  const input = body as Record<string, unknown>
  if (Object.keys(input).some((key) => key !== 'context')) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Only User context may be updated.',
    })
  }
  if (typeof input.context !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'User context must be a string.',
    })
  }
  const context = input.context.trim()
  if (context.length > USER_CONTEXT_MAX_LENGTH) {
    throw createError({
      statusCode: 400,
      statusMessage: `User context must not exceed ${USER_CONTEXT_MAX_LENGTH} characters.`,
    })
  }
  return context
}

export default defineEventHandler(async (event) => {
  const { uid } = await requireFirebaseBearerUser(event)
  const context = readContext(await readBody(event))
  const users = FIRESTORE_MUTATION_TARGETS.users
  const contexts = serverUserContextTarget(uid)

  await runGuardedServerTransaction(contexts.database, async (mutations) => {
    const [user, snapshot] = await Promise.all([
      mutations.read(users, uid),
      mutations.read<Record<string, unknown>>(
        contexts,
        UserContextStorage.document
      ),
    ])
    if (!user.exists) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Create the User before saving User context.',
      })
    }
    const now = FieldValue.serverTimestamp()
    if (snapshot.exists) {
      mutations.update(contexts, UserContextStorage.document, {
        context,
        updated: { at: now, by: uid },
      })
      return
    }
    const stamp = { at: now, by: uid }
    mutations.create(contexts, UserContextStorage.document, {
      context,
      created: stamp,
      updated: stamp,
    })
  })

  const response: UpdateCurrentUserContextResponse = {
    ok: true,
    context,
  }
  return response
})
