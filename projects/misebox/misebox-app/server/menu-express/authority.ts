import type { H3Event } from 'h3'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import {
  runGuardedServerTransaction,
  type GuardedServerTransaction,
} from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { serverAppUsersTarget } from 'fireux-core/runtime/app/server/mutation-targets'
import { defineFirestoreMutationTarget } from 'fireux-core/runtime/utils/firestore-mutations/target-definition'
import { requireChatSessionAccess } from 'fireux-core/runtime/server/utils/chat/session'
import { fail } from './contract'

export function context(event: H3Event) {
  const { appId } = useFireUXConfig(event)
  if (appId !== 'misebox-app')
    fail('Menu Express is unavailable in this App.', 404)
  const target = defineFirestoreMutationTarget({
    key: 'misebox.menu-express',
    lane: 'server',
    verbs: ['create', 'update'],
    database: { kind: 'runtime' },
    collectionPath: `apps/${appId}/menu_express_requests`,
  })
  return { appId, target }
}
export async function assertOperator(
  tx: GuardedServerTransaction,
  appId: string,
  uid: string
) {
  const member = await tx.read(serverAppUsersTarget(appId), uid)
  if (!member.exists || !['admin', 'dev'].includes(String(member.data?.role)))
    fail('Misebox operator access is required.', 403)
}
export async function operator(event: H3Event) {
  const { appId, target } = context(event)
  const { uid } = await requireFirebaseBearerUser(event)
  await runGuardedServerTransaction({ kind: 'runtime' }, (tx) =>
    assertOperator(tx, appId, uid)
  )
  return { appId, target, uid }
}

export function requireCustomer(
  tx: GuardedServerTransaction,
  appId: string,
  id: string,
  token: unknown,
  writable = false
) {
  return requireChatSessionAccess(tx, {
    appId,
    conversationId: id,
    token,
    writable,
  })
}
