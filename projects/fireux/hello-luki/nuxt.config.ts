import { defineFireuxApp } from 'fireux-app/config'

const app = defineFireuxApp({
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

// The full FireUX App scaffold remains intact. This greeting-only deployment
// has no SSR endpoints and uses Firebase Hosting's static output, not Functions.
export default {
  ...app,
  nitro: {
    ...app.nitro,
    preset: 'static',
    prerender: {
      ...app.nitro?.prerender,
      routes: ['/', '/robots.txt'],
      failOnError: true,
    },
  },
}
