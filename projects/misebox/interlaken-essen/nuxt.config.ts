import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'
import { withFireuxNuxtConfig } from 'fireux-core/config/app/nuxt-overrides'

const fireuxConfig = defineFireuxConfig({
  ecosystem: 'misebox',
  projectId: 'misebox',
  ecosystemId: 'misebox',
  id: 'interlaken-essen',
  name: 'Interlaken Essen',
  shortName: 'Interlaken Essen',
  brand: { owner: 'app', status: 'provisional' },
  role: 'tenant',
  selfJoinEnabled: true,
  domains: ['jobs'],
  profiles: ['agent', 'professional'],
  consoles: [],
  modules: [
    'fireux-sproochli',
    'fireux-marketplace',
    'fireux-places',
    'fireux-companies',
    [
      'fireux-jobs',
      {
        categories: ['hospitality'],
      },
    ],
  ],
  authDefaultMode: 'sign-up',
  authCompletion: {
    path: '/mis',
    title: 'Merci fürs Registriere!',
    description: 'Du bisch derbi. Mir leite di grad zu dim Platz wiiter.',
    actionLabel: 'Mis Interlaken Essen',
    delayMs: 1800,
  },
  authOnboarding: {
    title: 'Registrier di bi Interlaken Essen',
    description:
      'Din Misebox-Zuegang isch bereit. Schlüss d Registrierig für Interlaken Essen ab.',
    completeLabel: 'Registrierig abschliesse',
    skipLabel: 'Für itz überspringe',
  },
  seo: {
    siteUrl: 'https://interlaken-essen.misebox.app',
    noindexPaths: ['/mis', '/mis/**'],
  },
})

export default withFireuxNuxtConfig(fireuxConfig, {
  css: ['@/assets/styles/main.css'],
  fireuxBlogs: {
    languages: ['gsw', 'de', 'en'],
    defaultLanguage: 'gsw',
    selectionCookie: 'interlaken-essen.sproochli',
    queryParameter: 'sproochli',
  },
})
