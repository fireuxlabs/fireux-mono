// Runtime configuration for fireux-core module

// AppSettings interface
export interface AppSettings {
  projectName: string
  appName: string
  appId: string
  appShortName: string
  appPrimaryColor: string
  appNeutralColor: string
  appIcon: string
  domain: string
}

/**
 * Configure runtime settings for the Nuxt application
 * @param nuxt Nuxt instance
 */
export function configureRuntime(nuxt: any) {
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
}
