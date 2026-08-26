import { createError, defineEventHandler, readBody } from 'h3'
import { FIRESTORE_MUTATION_TARGETS } from '../../../../utils/firestore-mutations/targets'
import { requireFirebaseBearerUser } from '../../../utils/auth/bearer'
import { runGuardedServerTransaction } from '../../../utils/firestore-mutations/server-transaction'
import { isUserPing } from '../../../../user/models/user.model.ts'

function badRequest(statusMessage: string): never {
  throw createError({ statusCode: 400, statusMessage })
}

function readChange(body: unknown): Record<string, string> {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    badRequest('A profile change is required.')
  }
  const input = body as Record<string, unknown>
  const keys = Object.keys(input)
  if (
    keys.length !== 1 ||
    !['display_name', 'bio', 'avatar', 'ping'].includes(keys[0]!)
  ) {
    badRequest('Update one profile field at a time.')
  }

  const key = keys[0]!
  const raw = input[key]
  if (typeof raw !== 'string') badRequest(`${key} must be text.`)
  const value = raw.replaceAll('\r\n', '\n').trim()

  if (key === 'display_name' && (value.length < 2 || value.length > 60)) {
    badRequest('Display name must be between 2 and 60 characters.')
  }
  if (key === 'bio' && value.length > 280) {
    badRequest('Bio must be 280 characters or less.')
  }
  if (
    key === 'avatar' &&
    value !== '/img/ecosystem/avatar.png' &&
    !/^https:\/\/.+/.test(value)
  ) {
    badRequest('Avatar must be an HTTPS URL.')
  }
  if (key === 'ping' && !isUserPing(value)) {
    badRequest('Ping is invalid.')
  }

  return { [key]: value }
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
