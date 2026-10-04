declare module 'nuxt/schema' {
  interface RuntimeConfig {
    accountConnections: {
      origin: string
      miseboxOrigin: string
      peerSecret: string
      databaseId: string
    }
  }
}
export {}
