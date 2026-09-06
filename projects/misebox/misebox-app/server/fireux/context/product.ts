import { createError, getHeader, type H3Event } from 'h3'
import { verifyServiceAccountOidc } from 'fireux-core/runtime/server/utils/auth/service-account-oidc'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { sharedProductContext } from 'fireux-misebox/runtime/app/server/context/product'

const AUDIENCE = 'https://misebox.app/api/fireux/context/product'
const FIREUX_SERVICE_ACCOUNT =
  '549102750204-compute@developer.gserviceaccount.com'

export async function readFireuxProductContext(
  event: H3Event,
  projectIdInput: unknown
) {
  const token = getHeader(event, 'x-fireux-service-token') || ''
  if (!token || token.length > 8192)
    throw createError({
      statusCode: 401,
      statusMessage: 'FireUX service authentication is required.',
    })
  const principal = await verifyServiceAccountOidc(token, AUDIENCE).catch(
    () => null
  )
  if (!principal || principal.service_account_email !== FIREUX_SERVICE_ACCOUNT)
    throw createError({
      statusCode: 403,
      statusMessage: 'This service cannot read Misebox context.',
    })
  if (useFireUXConfig(event).appId !== 'misebox-app')
    throw createError({
      statusCode: 403,
      statusMessage: 'This endpoint belongs to Misebox.',
    })
  const projectId = requireFirestoreDocumentId(
    projectIdInput,
    'FireUX Project id'
  )
  const db = getRuntimeFirestore()
  const [app, ecosystem] = await Promise.all([
    db.doc('apps/misebox-app').get(),
    db.doc('ecosystems/misebox').get(),
  ])
  if (
    !app.exists ||
    app.data()?.ecosystem_id !== 'misebox' ||
    !ecosystem.exists ||
    ecosystem.data()?.project_id !== projectId
  )
    throw createError({
      statusCode: 404,
      statusMessage: 'No shared context belongs to this Project.',
    })
  const record = await db.doc('apps/misebox-app/context/product').get()
  if (!record.exists)
    throw createError({
      statusCode: 404,
      statusMessage: 'Product context is unavailable.',
    })
  return sharedProductContext(
    record.data()!,
    String(ecosystem.data()?.project_id),
    projectId
  )
}
