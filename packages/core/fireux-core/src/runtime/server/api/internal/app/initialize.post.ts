import { useRuntimeConfig } from '#imports'
import { defineEventHandler } from 'h3'
import { useFireUXConfig } from '../../../../app/composables/config/FireUXConfig'
import { requireDevDeveloper } from '../../../utils/auth/developer'
import { initializeRuntimeApp } from '../../../../app/server/initialization/initialize'

export default defineEventHandler(async (event) => {
  const { uid } = await requireDevDeveloper(event)
  const config = useFireUXConfig(event)
  const runtime = useRuntimeConfig(event)
  const ecosystem = runtime.public?.firebaseEcosystem as
    | Record<string, unknown>
    | undefined
  const firebase = runtime.public?.firebaseEcosystem?.firebase as
    | Record<string, unknown>
    | undefined
  const appDatabaseId = String(firebase?.databaseId || '').trim()
  const identityDatabaseId = String(
    firebase?.identityDatabaseId || appDatabaseId
  ).trim()

  return initializeRuntimeApp({
    uid,
    config,
    appDatabaseId,
    identityDatabaseId,
    ecosystem: {
      name: String(ecosystem?.name || ''),
      description: String(ecosystem?.description || ''),
    },
    context: runtime.fireux?.initialAppContext,
  })
})
