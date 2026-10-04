declare module 'nuxt/schema' {
  interface RuntimeConfig {
    accountConnections: {
      origin: string
      hubOrigin: string
      peerSecret: string
    }
  }
  interface PublicRuntimeConfig {
    sharedSignIn: { enabled: boolean }
  }
}
export {}
