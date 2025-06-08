import {
  defineNuxtModule,
  createResolver,
  addComponentsDir,
  addImportsDir,
  addImports,
  addPlugin,
} from '@nuxt/kit'
import { version } from '../package.json'

// Simple module options
export interface ModuleOptions {
  /**
   * Prefix for components
   * @defaultValue `Fire`
   */
  prefix?: string
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

    // Register all components with a single registration
    addComponentsDir({
      path: resolvePath('./runtime/components'),
      pattern: '**/*.vue',
      prefix: options.prefix,
      global: true,
      pathPrefix: true,
      watch: true,
    })
    // Add top-level composables
    addImportsDir([resolvePath('./runtime/composables/**/*.ts')])


    // Extend public runtimeConfig
    nuxt.options.runtimeConfig.public = {
      ...nuxt.options.runtimeConfig.public,
      firebaseConfig: {
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.FIREBASE_APP_ID,
        measurementId: process.env.FIREBASE_MEASUREMENT_ID,
      },
      domain: process.env.DOMAIN,
      pin: process.env.PIN,
      tenantId: process.env.TENANT_ID,
      appName: process.env.APP_NAME,
      appShortName: process.env.APP_SHORT_NAME,
      appThemeColor: process.env.APP_THEME_COLOR,
      appBackgroundColor: process.env.APP_BACKGROUND_COLOR,
      appIcon: process.env.APP_ICON,
      nodeEnv: process.env.NODE_ENV || 'development',
    }
    // Extend private runtimeConfig
    nuxt.options.runtimeConfig = {
      ...nuxt.options.runtimeConfig,
      authorName: process.env.AUTHOR_NAME,
      projectName: process.env.PROJECT_NAME,
      openaiApiKeyName: process.env.OPENAI_API_KEY_NAME,
      openaiApiKey: process.env.OPENAI_API_KEY,
      stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      stripeSecretKey: process.env.STRIPE_SECRET_KEY,
      stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
      githubToken: process.env.GITHUB_TOKEN,
    }
    // Register the Firebase client plugin
    addPlugin({
      src: resolvePath('./runtime/firebase.client.ts'),
      mode: 'client',
    })
  },
})
