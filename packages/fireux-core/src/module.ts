import {
  defineNuxtModule,
  createResolver,
  addComponentsDir,
  addImportsDir,
  addPlugin,
  addServerHandler,
} from '@nuxt/kit'
import { version } from '../package.json'

// Module options interface
export interface ModuleOptions {
  /**
   * Prefix for components
   * @defaultValue `Fire`
   */
  prefix?: string
}

// AppSettings interface
interface AppSettings {
  projectName: string
  appName: string
  appId: string
  appShortName: string
  appPrimaryColor: string
  appNeutralColor: string
  appIcon: string
  domain: string
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'fireux-core',
    version,
    configKey: 'fireuxCore',
  },
  defaults: {
    prefix: 'Fire',
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)
    const resolvePath = (p: string) => resolver.resolve(p)

    // Register components
    addComponentsDir({
      path: resolvePath('./runtime/components'),
      pattern: '**/*.vue',
      prefix: options.prefix,
      global: true,
      pathPrefix: true,
      watch: true,
    })

    // Register layouts as components
    addComponentsDir({
      path: resolvePath('./runtime/layouts'),
      pattern: '**/*.vue',
      prefix: 'Core',
      global: true,
      pathPrefix: false,
      watch: true,
    })

    // Add composables
    addImportsDir([resolvePath('./runtime/composables/**/*.ts')])

    // Register API routes
    addServerHandler({
      route: '/api/env-check',
      handler: resolvePath('./runtime/server/api/env-check'),
    })

    // Extend public runtimeConfig
    nuxt.options.runtimeConfig.public = {
      ...nuxt.options.runtimeConfig.public,
      devMode: process.env.NODE_ENV === 'development', // Add devMode based on NODE_ENV
      firebaseConfig: {
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.FIREBASE_APP_ID,
        measurementId: process.env.FIREBASE_MEASUREMENT_ID,
      },
      appSettings: {
        projectName: process.env.PROJECT_NAME,
        appName: process.env.APP_NAME,
        appId: process.env.APP_ID,
        appShortName: process.env.APP_SHORT_NAME,
        appPrimaryColor: process.env.APP_PRIMARY_COLOR,
        appNeutralColor: process.env.APP_NEUTRAL_COLOR,
        appIcon: process.env.APP_ICON,
        domain: process.env.DOMAIN,
      } as AppSettings,
    }

    // Extend private runtimeConfig
    nuxt.options.runtimeConfig = {
      ...nuxt.options.runtimeConfig,
      authorDetails: {
        authorName: process.env.AUTHOR_NAME,
        projectName: process.env.PROJECT_NAME,
      },
      openaiConfig: {
        openaiApiKeyName: process.env.OPENAI_API_KEY_NAME,
        openaiApiKey: process.env.OPENAI_API_KEY,
      },
      stripeConfig: {
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
        secretKey: process.env.STRIPE_SECRET_KEY,
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
      },
      githubConfig: {
        token: process.env.GITHUB_TOKEN,
      },
      consolidatedPin: process.env.PIN,
    }

    // Register Firebase client plugin
    addPlugin({
      src: resolvePath('./runtime/firebase.client.ts'),
      mode: 'client',
    })

    // Expose public directory
    nuxt.options.alias['#fireux-core-public'] = resolvePath('./runtime/public')
    nuxt.hook('nitro:config', (config) => {
      config.publicAssets = config.publicAssets || []
      config.publicAssets.push({
        dir: resolvePath('./runtime/public'),
        baseURL: '/fireux-core',
      })
    })
  },
})
