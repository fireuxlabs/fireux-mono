import { defineEventHandler } from 'h3'
import { useRuntimeConfig } from '#imports'

interface FirebaseConfig {
  apiKey: string
  authDomain: string
  projectId: string
  storageBucket: string
  messagingSenderId: string
  appId: string
  measurementId: string
}

interface PublicConfig {
  firebaseConfig: FirebaseConfig
  domain: string
  pin: string
  tenantId: string
  appName: string
  appShortName: string
  appThemeColor: string
  appBackgroundColor: string
  appIcon: string
  nodeEnv: string
}

interface RuntimeConfig {
  public: PublicConfig
  stripePublishableKey: string
  stripeSecretKey: string
  stripeWebhookSecret: string
  githubToken: string
}

export default defineEventHandler(() => {
  const isValidEnv = (val: unknown): boolean =>
    typeof val === 'string' && val.trim().length > 0

  const runtimeConfig = useRuntimeConfig() as unknown as RuntimeConfig

  const publicConfig = runtimeConfig.public
  const privateConfig = {
    stripePublishableKey: runtimeConfig.stripePublishableKey,
    stripeSecretKey: runtimeConfig.stripeSecretKey,
    stripeWebhookSecret: runtimeConfig.stripeWebhookSecret,
    githubToken: runtimeConfig.githubToken,
  }

  const requiredVars = {
    firebaseConfig: {
      apiKey: publicConfig.firebaseConfig.apiKey,
      authDomain: publicConfig.firebaseConfig.authDomain,
      projectId: publicConfig.firebaseConfig.projectId,
      storageBucket: publicConfig.firebaseConfig.storageBucket,
      messagingSenderId: publicConfig.firebaseConfig.messagingSenderId,
      appId: publicConfig.firebaseConfig.appId,
      measurementId: publicConfig.firebaseConfig.measurementId,
    },
    domain: publicConfig.domain,
    pin: publicConfig.pin,
    tenantId: publicConfig.tenantId,
    appName: publicConfig.appName,
    appShortName: publicConfig.appShortName,
    appThemeColor: publicConfig.appThemeColor,
    appBackgroundColor: publicConfig.appBackgroundColor,
    appIcon: publicConfig.appIcon,
    nodeEnv: publicConfig.nodeEnv,
    stripePublishableKey: privateConfig.stripePublishableKey,
    stripeSecretKey: privateConfig.stripeSecretKey,
    stripeWebhookSecret: privateConfig.stripeWebhookSecret,
    githubToken: privateConfig.githubToken,
  }

  const missingVars = Object.entries(requiredVars)
    .filter(([_, value]) => !isValidEnv(value))
    .map(([key]) => key)

  return {
    isValid: missingVars.length === 0,
    requiredVars,
    missingVars,
  }
})
