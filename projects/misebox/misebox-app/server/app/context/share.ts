import { createError, type H3Event } from 'h3'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { defineFirestoreMutationTarget } from 'fireux-core/runtime/utils/firestore-mutations/target-definition'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { serverAppUsersTarget } from 'fireux-core/runtime/utils/firestore-mutations/server-targets'
export async function shareProductContext(event: H3Event, body: unknown) {
  const { uid } = await requireFirebaseBearerUser(event)
  const { appId } = useFireUXConfig(event)
  const enabled = (body as { enabled?: unknown } | null)?.enabled
  if (appId !== 'misebox-app' || typeof enabled !== 'boolean')
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid sharing request.',
    })
  const target = (collectionPath: string) =>
    defineFirestoreMutationTarget({
      key: 'misebox.product-context-sharing',
      lane: 'server',
      verbs: ['update'],
      database: { kind: 'runtime' },
      collectionPath,
    })
  await runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
    const [member, app, ecosystem, context] = await Promise.all([
      tx.read<Record<string, unknown>>(serverAppUsersTarget(appId), uid),
      tx.read<Record<string, unknown>>(target('apps'), appId),
      tx.read<Record<string, unknown>>(target('ecosystems'), 'misebox'),
      tx.read(target('apps/misebox-app/context'), 'product'),
    ])
    if (!member.exists || !['admin', 'dev'].includes(String(member.data?.role)))
      throw createError({
        statusCode: 403,
        statusMessage: 'Misebox App management access is required.',
      })
    if (!app.exists || app.data?.ecosystem_id !== 'misebox' || !context.exists)
      throw createError({
        statusCode: 409,
        statusMessage: 'App context relationship is unavailable.',
      })
    const projectId = ecosystem.data?.project_id
    if (
      enabled &&
      (!ecosystem.exists ||
        typeof projectId !== 'string' ||
        !projectId ||
        projectId.includes('/'))
    )
      throw createError({
        statusCode: 409,
        statusMessage: 'Misebox has no valid owning Project.',
      })
    tx.update(target('apps/misebox-app/context'), 'product', {
      fireuxSharing: {
        enabled,
        firebaseProjectId: 'fireux-2005',
        projectId: typeof projectId === 'string' ? projectId : '',
        approvedBy: uid,
      },
    })
  })
  return { enabled }
}
