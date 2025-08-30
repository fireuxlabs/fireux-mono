import { addPlugin } from '@nuxt/kit'

export function configurePlugins(resolver: any) {
  // Client/runtime plugin example; add more as needed
  const maybeClient = resolver.resolve('../runtime/plugins/firebase.client.ts')
  addPlugin({ src: maybeClient, mode: 'client' })
}
