import { contextChange } from '../../../server/utils/records/context'
import { FieldValue } from 'firebase-admin/firestore'
import { createError, readBody, type H3Event } from 'h3'
import {
  USER_CONTEXT_MAX_LENGTH,
  UserContextStorage,
  type UpdateCurrentUserContextResponse,
} from '../../models/user-context.model'
import {
  USER_MUTATION_TARGETS,
  serverUserContextTarget,
} from '../mutation-targets'
import { requireFirebaseBearerUser } from '../../../server/utils/auth/bearer'
import { runGuardedServerTransaction } from '../../../server/utils/firestore-mutations/server-transaction'

function readContext(body: unknown) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'User context payload must be an object.',
    })
  }
  const input = body as Record<string, unknown>
  if (
    Object.keys(input).some((key) => !['context', 'previous'].includes(key))
  ) {
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
  return {
    context,
    ...(Object.hasOwn(input, 'previous') ? { previous: input.previous } : {}),
  }
}

export async function updateUserContext(event: H3Event) {
  const { uid } = await requireFirebaseBearerUser(event)
  const change = readContext(await readBody(event))
  const { context } = change
  const users = USER_MUTATION_TARGETS.users
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
    if (Object.hasOwn(change, 'previous')) {
      const current =
        typeof snapshot.data?.context === 'string'
          ? snapshot.data.context.trim()
          : ''
      contextChange(change, current)
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
}
