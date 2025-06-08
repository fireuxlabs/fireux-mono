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

interface AppSettings {
  domain: string
  pin: string
  appName: string
  appShortName: string
  appThemeColor: string
  appBackgroundColor: string
  appIcon: string
  nodeEnv: string
}

interface PublicConfig {
  firebaseConfig: FirebaseConfig
  appSettings: AppSettings
}

interface PrivateConfig {
  stripePublishableKey: string
  stripeSecretKey: string
  stripeWebhookSecret: string
  githubToken: string
}

interface RuntimeConfig {
  public: PublicConfig
  private: PrivateConfig
}

export default defineEventHandler(() => {
  const isValidEnv = (val: unknown): boolean =>
    typeof val === 'string' && val.trim().length > 0

  const runtimeConfig = useRuntimeConfig() as unknown as RuntimeConfig

  const { public: publicConfig, private: privateConfig } = runtimeConfig

  const requiredVars = {
    firebaseConfig: publicConfig.firebaseConfig,
    appSettings: publicConfig.appSettings,
    stripePublishableKey: privateConfig?.stripePublishableKey || null, // Fallback to null
    stripeSecretKey: privateConfig?.stripeSecretKey || null, // Fallback to null
    stripeWebhookSecret: privateConfig?.stripeWebhookSecret || null, // Fallback to null
    githubToken: privateConfig?.githubToken || null, // Fallback to null
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
