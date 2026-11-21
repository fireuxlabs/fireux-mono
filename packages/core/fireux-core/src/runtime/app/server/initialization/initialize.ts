import { createError } from 'h3'
import type { FireUXConfig } from '../../composables/config/FireUXConfig'
import { getRuntimeIdentityFirestore } from '../../../server/utils/getRuntimeFirestore'
import { reconcileUserAppReference } from '../membership/user-reference'
import { reconcileAppEcosystemReference } from '../relationships/ecosystem-reference'
import { initializeAppWithAdministrator } from './initialize-transaction'

type InitializeRuntimeAppInput = {
  uid: string
  config: Readonly<FireUXConfig>
  appDatabaseId: string
  identityDatabaseId: string
  context: string
}

function conflict(statusMessage: string): never {
  throw createError({ statusCode: 409, statusMessage })
}

export async function requireInitializationUser(
  uid: string,
  identityDatabaseId: string
) {
  const user = await getRuntimeIdentityFirestore(identityDatabaseId)
    .collection('users')
    .doc(uid)
    .get()
  if (!user.exists) conflict('The User record does not exist.')
}

export async function initializeRuntimeApp(input: InitializeRuntimeAppInput) {
  const { uid, config, context, appDatabaseId, identityDatabaseId } = input
  const sameDatabase = appDatabaseId === identityDatabaseId
  if (!sameDatabase) await requireInitializationUser(uid, identityDatabaseId)

  const ecosystem = await getRuntimeIdentityFirestore(identityDatabaseId)
    .collection('ecosystems')
    .doc(config.ecosystemId)
    .get()
  if (!ecosystem.exists)
    conflict(`The App references missing Ecosystem ${config.ecosystemId}.`)

  const result = await initializeAppWithAdministrator(
    uid,
    config,
    context,
    sameDatabase
  )

  const reference = {
    appId: config.appId,
    appDatabaseId,
    identityDatabaseId,
  }
  await reconcileUserAppReference({ ...reference, userId: uid })
  await reconcileAppEcosystemReference(reference)
  return result
}
