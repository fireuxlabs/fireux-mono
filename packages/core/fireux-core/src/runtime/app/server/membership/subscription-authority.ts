import type { AppUserRole } from '../../models/app-user.model.ts'

type SubscriptionAuthorityInput = {
  action: 'set-subscription' | 'set-self-subscription'
  actorUid: string
  actorRole: AppUserRole | null
  userId?: string
}

export type SubscriptionAuthorityResult =
  | { ok: true; userId: string }
  | { ok: false; statusCode: 400 | 403; message: string }

export function resolveSubscriptionMutationAuthority(
  input: SubscriptionAuthorityInput
): SubscriptionAuthorityResult {
  if (input.action === 'set-self-subscription') {
    return import.meta.dev
      ? { ok: true, userId: input.actorUid }
      : {
          ok: false,
          statusCode: 403,
          message: 'Self subscription changes are development-only.',
        }
  }
  if (input.actorRole !== 'admin' && input.actorRole !== 'dev') {
    return {
      ok: false,
      statusCode: 403,
      message: 'App admin access is required.',
    }
  }
  const userId = String(input.userId ?? '').trim()
  return userId && !userId.includes('/')
    ? { ok: true, userId }
    : { ok: false, statusCode: 400, message: 'User id is invalid.' }
}
