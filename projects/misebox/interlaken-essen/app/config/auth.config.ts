import type { FireuxAppConfig } from 'fireux-core/config/app/types'

type InterlakenEssenAuthConfig = Pick<
  FireuxAppConfig,
  'authDefaultMode' | 'authCompletion' | 'authOnboarding'
>

export const interlakenEssenAuthConfig = {
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
} satisfies InterlakenEssenAuthConfig
