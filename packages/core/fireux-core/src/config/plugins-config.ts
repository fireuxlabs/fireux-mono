import { addPlugin } from '@nuxt/kit'

export function configurePlugins(resolver: any) {
  // Client/runtime plugin example; add more as needed
  const firebaseInit = resolver.resolve('./runtime/plugins/firebase.client.ts')
  addPlugin({ src: firebaseInit, mode: 'client' })

  // Hydrate AppUser/AppUsers into global state once on client
  const appUserHydrator = resolver.resolve(
    './runtime/plugins/app-user.client.ts'
  )
  addPlugin({ src: appUserHydrator, mode: 'client' })
}
