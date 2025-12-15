import { defineNuxtModule } from '@nuxt/kit'
import { primeSandboxFirebaseEnv } from './config/firebase-env'

export default defineNuxtModule({
  meta: {
    name: 'fireux-sandbox',
    version: '0.1.0',
    configKey: 'fireuxSandbox',
  },
  setup(_options, nuxt) {
    // Prime the shared Firebase env vars (dummy by default, override via sandbox .env)
    primeSandboxFirebaseEnv({
      apiKey: process.env.NUXT_FIREBASE_API_KEY,
      authDomain: process.env.NUXT_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NUXT_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NUXT_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NUXT_FIREBASE_MESSAGING_SENDER_ID,
    })

    // Feed visible runtimeConfig so the sandbox page can confirm the ecosystem module ran.
    nuxt.options.runtimeConfig ||= {} as any
    nuxt.options.runtimeConfig.public ||= {} as any

    ;(nuxt.options.runtimeConfig.public as any).fireux = {
      id: 'core-sandbox',
      name: 'Core Sandbox',
      shortName: 'Sandbox',
      description: 'Minimal sandbox to validate ecosystem feeding.',
      domain: process.env.APP_DOMAIN || 'http://localhost:3099',
      role: 'global',
      ecosystem: 'sandbox',
      modules: ['fireux-core', 'fireux-sandbox'],
    }

    ;(nuxt.options.runtimeConfig.public as any).sandbox = {
      hello: process.env.SANDBOX_HELLO || 'missing',
      primedFirebaseEnv: {
        NUXT_FIREBASE_API_KEY: process.env.NUXT_FIREBASE_API_KEY || '',
        NUXT_FIREBASE_AUTH_DOMAIN: process.env.NUXT_FIREBASE_AUTH_DOMAIN || '',
        NUXT_FIREBASE_PROJECT_ID: process.env.NUXT_FIREBASE_PROJECT_ID || '',
        NUXT_FIREBASE_STORAGE_BUCKET: process.env.NUXT_FIREBASE_STORAGE_BUCKET || '',
        NUXT_FIREBASE_MESSAGING_SENDER_ID: process.env.NUXT_FIREBASE_MESSAGING_SENDER_ID || '',
      },
    }

    nuxt.hook('ready', () => {
      console.log('fireux-sandbox: module configured')
    })
  },
})
