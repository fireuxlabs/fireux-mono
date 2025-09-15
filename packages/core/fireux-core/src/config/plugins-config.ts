import { addPlugin } from '@nuxt/kit'

export function configurePlugins(resolver: any) {
  // Client/runtime plugin example; add more as needed
  const firebaseInit = resolver.resolve('./runtime/plugins/firebase.client.ts')
  addPlugin({ src: firebaseInit, mode: 'client' })

  // Dev-only: trace Vue inject() warnings with component file + stack hint
  const injectTraceServer = resolver.resolve(
    './runtime/plugins/inject-trace.server.ts'
  )
  addPlugin({ src: injectTraceServer, mode: 'server' })

  // Client tracer forwards events to server (no client console noise)
  const injectTraceClient = resolver.resolve(
    './runtime/plugins/inject-trace.client.ts'
  )
  addPlugin({ src: injectTraceClient, mode: 'client' })
}
