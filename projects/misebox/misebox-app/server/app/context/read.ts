import { projectProductContext } from 'fireux-misebox/runtime/app/server/context/product'
import { createHash } from 'node:crypto'
import { createError, type H3Event } from 'h3'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import type { MiseboxProductContextResponse } from '../../../app/models/product-context'

export async function readMiseboxProductContext(
  event: H3Event
): Promise<MiseboxProductContextResponse> {
  const { uid } = await requireFirebaseBearerUser(event)
  const { appId } = useFireUXConfig(event)
  if (appId !== 'misebox-app')
    throw createError({
      statusCode: 403,
      statusMessage: 'This context belongs to the Misebox App.',
    })
  const db = getRuntimeFirestore()
  const app = db.collection('apps').doc(appId)
  const membership = await app.collection('users').doc(uid).get()
  if (
    !membership.exists ||
    !['admin', 'dev'].includes(String(membership.data()?.role))
  )
    throw createError({
      statusCode: 403,
      statusMessage: 'Misebox App management access is required.',
    })
  const snapshot = await app.collection('context').doc('product').get()
  if (!snapshot.exists)
    throw createError({
      statusCode: 404,
      statusMessage: 'Product context has not been created.',
    })
  const context = projectProductContext(snapshot.data())
  return {
    appId,
    contextId: 'product',
    sourcePath: `apps/${appId}/context/product`,
    revision: createHash('sha256')
      .update(JSON.stringify(context))
      .digest('hex'),
    context,
    sharing: snapshot.data()?.fireuxSharing?.enabled === true,
  }
}
