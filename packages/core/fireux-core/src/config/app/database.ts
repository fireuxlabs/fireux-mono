import { defineNuxtModule } from '@nuxt/kit'

export function createAppDatabaseRuntimeModule(databaseId?: string) {
  const resolvedDatabaseId = typeof databaseId === 'string' ? databaseId.trim() : ''
  if (!resolvedDatabaseId) return null

  return defineNuxtModule({
    meta: {
      name: 'fireux-app-database-runtime',
    },
    setup(_options, nuxt) {
      const runtime = ((nuxt.options as any).runtimeConfig ||= {}) as Record<string, any>
      const pub = ((runtime.public ||= {}) as Record<string, any>)
      const ecosystem = ((pub.firebaseEcosystem ||= {}) as Record<string, any>)
      const firebase = ((ecosystem.firebase ||= {}) as Record<string, any>)
      firebase.identityDatabaseId ||= firebase.databaseId || resolvedDatabaseId
      firebase.databaseId = resolvedDatabaseId
    },
  })
}
