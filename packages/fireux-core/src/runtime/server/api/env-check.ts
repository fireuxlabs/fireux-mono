import { defineEventHandler } from 'h3'
import { useRuntimeConfig } from '#imports'

export default defineEventHandler(() => {
  const runtimeConfig = useRuntimeConfig()

  const requiredVars = [
    'public.firebaseConfig.apiKey',
    'public.firebaseConfig.authDomain',
    'public.firebaseConfig.projectId',
    'public.firebaseConfig.storageBucket',
    'public.firebaseConfig.messagingSenderId',
    'public.firebaseConfig.appId',
    'public.firebaseConfig.measurementId',
    'public.appSettings.projectName',
    'public.appSettings.appName',
    'public.appSettings.appId',
    'public.appSettings.appShortName',
    'public.appSettings.appPrimaryColor',
    'public.appSettings.appNeutralColor',
    'public.appSettings.appIcon',
    'public.appSettings.domain',
    'stripeConfig.publishableKey',
    'stripeConfig.secretKey',
  ]

  const missingVars = requiredVars.filter((key) => {
    const keys = key.split('.')
    let value = runtimeConfig
    for (const k of keys) {
      if (value && k in value) {
        value = value[k]
      } else {
        return true
      }
    }
    return !value
  })

  return {
    isValid: missingVars.length === 0,
    requiredVars,
    missingVars,
  }
})
