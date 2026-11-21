import { defineFireuxApp } from 'fireux-app/config'

export default defineFireuxApp({
  ecosystem: 'fireux',
  projectId: 'fireux',
  ecosystemId: 'fireux',
  id: 'hello-luki',
  name: 'Hello Luki',
  shortName: 'Luki',
  context: 'A minimal FireUX standalone App proving the path from a request to a public greeting.',
  role: 'standalone',
  databaseId: 'hello-luki',
  seo: {
    noindexPaths: ['/', '/**'],
    disallowPaths: ['/'],
  },
})
