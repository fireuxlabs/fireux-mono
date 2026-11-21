import { useRuntimeConfig } from '#imports'
import { createError, defineEventHandler } from 'h3'
import { useFireUXConfig } from '../../../../app/composables/config/FireUXConfig'
import { requireDevDeveloper } from '../../../utils/auth/developer'
import {
  initializeRuntimeApp,
  requireInitializationUser,
} from '../../../../app/server/initialization/initialize'
import { assertExistingAppMatchesRuntime } from '../../../../app/server/initialization/initialize-transaction'
import type { AppInitializationResult } from '../../../../app/contracts/initialization'
import { provisionEcosystem } from '../../../../ecosystem/server/identity/provision'
import { getRuntimeFirestore } from '../../../utils/getRuntimeFirestore'

export default defineEventHandler(
  async (event): Promise<AppInitializationResult> => {
    const { uid } = await requireDevDeveloper(event)
    const config = useFireUXConfig(event)
    const runtime = useRuntimeConfig(event)
    const firebase = runtime.public?.firebaseEcosystem?.firebase as
      | Record<string, unknown>
      | undefined
    const appDatabaseId = String(firebase?.databaseId || '').trim()
    const identityDatabaseId = String(
      firebase?.identityDatabaseId || appDatabaseId
    ).trim()

    const context = runtime.fireux?.initialAppContext
    if (
      context !== undefined &&
      (typeof context !== 'string' || context.length > 32000)
    )
      throw createError({
        statusCode: 400,
        statusMessage: 'App context must be text up to 32,000 characters.',
      })

    let ecosystemCreated = false
    if (
      config.role === 'global' &&
      config.projectId === config.ecosystemId &&
      config.appId === `${config.ecosystemId}-app`
    ) {
      const ecosystem = runtime.public?.firebaseEcosystem
      const sameDatabase = appDatabaseId === identityDatabaseId
      if (!sameDatabase)
        await requireInitializationUser(uid, identityDatabaseId)

      ecosystemCreated = await provisionEcosystem({
        uid,
        ecosystemId: config.ecosystemId,
        projectId: config.projectId,
        name: String(ecosystem?.name || ''),
        description: String(ecosystem?.description || ''),
        checkPrerequisites: async () => {
          if (sameDatabase)
            await requireInitializationUser(uid, identityDatabaseId)

          const database = getRuntimeFirestore(appDatabaseId)
          const app = await database.collection('apps').doc(config.appId).get()
          if (app.exists) {
            assertExistingAppMatchesRuntime(app.data() ?? {}, config)
          } else {
            const membership = await database
              .doc(`apps/${config.appId}/users/${uid}`)
              .get()
            if (membership.exists)
              throw createError({
                statusCode: 409,
                statusMessage:
                  'An App membership exists without its canonical App record.',
              })
          }
        },
      })
    }

    const result = await initializeRuntimeApp({
      uid,
      config,
      appDatabaseId,
      identityDatabaseId,
      context: context?.trim() || '',
    })
    return { ...result, ecosystemCreated }
  }
)
