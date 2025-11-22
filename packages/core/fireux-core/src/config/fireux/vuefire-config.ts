import { env } from './env'
import type { ServiceAccountPayload } from './service-account'

export interface VuefireConfigOptions {
  overrides?: Record<string, any>
  serviceAccount?: ServiceAccountPayload['credentials']
}

export function createVuefireConfig(
  options: VuefireConfigOptions
): Record<string, any> {
  const { overrides, serviceAccount } = options
  const appCheckKey = env('FIREBASE_RECAPTCHA_V3_KEY')

  const base: Record<string, any> = {
    auth: { enabled: true, sessionCookie: false },
    config: {
      apiKey: env('FIREBASE_API_KEY'),
      authDomain: env('FIREBASE_AUTH_DOMAIN'),
      projectId: env('FIREBASE_PROJECT_ID'),
      storageBucket: env('FIREBASE_STORAGE_BUCKET'),
      messagingSenderId: env('FIREBASE_MESSAGING_SENDER_ID'),
      appId: env('FIREBASE_APP_ID'),
      measurementId: env('FIREBASE_MEASUREMENT_ID'),
    },
    appCheck: appCheckKey
      ? {
          debug: false,
          isTokenAutoRefreshEnabled: true,
          provider: 'ReCaptchaV3',
          key: appCheckKey,
        }
      : undefined,
    ...(serviceAccount ? { admin: { serviceAccount } } : {}),
  }

  return { ...base, ...(overrides ?? {}) }
}
