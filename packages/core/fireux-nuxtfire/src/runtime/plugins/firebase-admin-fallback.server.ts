import { ensureAdminApp } from 'vuefire/server'
import { defineNuxtPlugin, useRequestEvent, useRuntimeConfig } from '#imports'

export default defineNuxtPlugin(() => {
  const event = useRequestEvent()
  const { vuefire } = useRuntimeConfig()

  // In dev, we often run SSR + client auth without a service account.
  // nuxt-vuefire still installs its server auth plugin, which expects an
  // injected `$firebaseAdminApp`. Provide a best-effort admin app so it
  // doesn't crash with "The default Firebase app does not exist".
  const firebaseAdminApp = ensureAdminApp(vuefire?.admin?.options)

  if (event) {
    event.context.firebaseApp = firebaseAdminApp
  }

  return {
    provide: {
      firebaseAdminApp,
    },
  }
})
