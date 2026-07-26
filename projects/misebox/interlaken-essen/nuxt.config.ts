import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'
import { withFireuxNuxtConfig } from 'fireux-core/config/app/nuxt-overrides'

const fireuxConfig = defineFireuxConfig({
  ecosystem: 'misebox',
  projectId: 'misebox',
  ecosystemId: 'misebox',
  id: 'interlaken-essen',
  name: 'Interlaken Essen',
  shortName: 'Interlaken Essen',
  role: 'tenant',
  selfJoinEnabled: true,
  consoles: [],
  modules: ['fireux-sproochli', 'fireux-marketplace'],
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
  },
})

export default withFireuxNuxtConfig(fireuxConfig, {
  css: ['@/assets/styles/main.css'],
  fireuxBlogs: {
    languages: ['gsw', 'en'],
    defaultLanguage: 'gsw',
    selectionCookie: 'interlaken-essen.sproochli',
    queryParameter: 'sproochli',
  },
})
