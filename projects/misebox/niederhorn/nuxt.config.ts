import { existsSync } from 'node:fs'
import { defineNuxtConfig } from 'nuxt/config'
import type { NuxtConfig } from 'nuxt/schema'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const currentDir = dirname(fileURLToPath(import.meta.url))
const workspaceRoot = (() => {
  let cursor = currentDir
  for (let i = 0; i < 10; i += 1) {
    if (
      existsSync(resolve(cursor, 'pnpm-workspace.yaml')) ||
      existsSync(resolve(cursor, '.git'))
    ) {
      return cursor
    }
    const parent = resolve(cursor, '..')
    if (parent === cursor) break
    cursor = parent
  }
  return cursor
})()

export default defineNuxtConfig(<NuxtConfig>{
  srcDir: 'app',
  imports: { dirs: ['composables/**', 'utils/**'] },
  modules: [
    '@nuxt/ui',
    '@nuxt/icon',
    [
      'nuxt-vuefire',
      {
        auth: { enabled: true, sessionCookie: false },
        config: {
          apiKey: process.env.NUXT_FIREBASE_API_KEY,
          authDomain: process.env.NUXT_FIREBASE_AUTH_DOMAIN,
          projectId: process.env.NUXT_FIREBASE_PROJECT_ID,
          storageBucket: process.env.NUXT_FIREBASE_STORAGE_BUCKET,
          messagingSenderId: process.env.NUXT_FIREBASE_MESSAGING_SENDER_ID,
          appId: process.env.NUXT_FIREBASE_APP_ID,
          measurementId: process.env.NUXT_FIREBASE_MEASUREMENT_ID,
        },
        appCheck: {
          debug: false,
          isTokenAutoRefreshEnabled: true,
          provider: 'ReCaptchaV3',
          key: process.env.NUXT_FIREBASE_RECAPTCHA_V3_KEY,
        },
        admin: {
          serviceAccount: {
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY,
          },
        },
      },
    ],
    [
      '@vite-pwa/nuxt',
      {
        registerType: 'autoUpdate',
        injectRegister: 'auto',
        workbox: { navigateFallback: '/' },
        manifest: {
          name: 'Niederhorn',
          short_name: 'Niederhorn',
          description: 'Tenant experience for Niederhorn hospitality partners.',
          scope: '/',
          start_url: '/',
          display: 'standalone',
          background_color: '#ffffff',
          theme_color: process.env.APP_PRIMARY_COLOR as string,
          lang: 'en',
          icons: [
            { src: '/img/app/pwa/icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: '/img/app/pwa/icon-512.png', sizes: '512x512', type: 'image/png' },
          ],
        },
      },
    ],
    'fireux-core',
    'fireux-misebox',
  ],
  fonts: { provider: 'none' },
  app: {
    head: {
      title: 'Niederhorn',
      meta: [
        { name: 'theme-color', content: process.env.APP_PRIMARY_COLOR as string },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        {
          name: 'apple-mobile-web-app-status-bar-style',
          content: 'black-translucent',
        },
        { name: 'mobile-web-app-capable', content: 'yes' },
      ],
      link: [
        { rel: 'manifest', href: '/manifest.webmanifest' },
        { rel: 'icon', href: '/favicon.ico' },
        {
          rel: 'apple-touch-icon',
          sizes: '180x180',
          href: '/img/app/pwa/icon-192.png',
        },
      ],
    },
  },
  runtimeConfig: {
    googlePlacesApiKey: process.env.GOOGLE_PLACES_API_KEY,
    firebaseServiceAccount: process.env.FIREBASE_SERVICE_ACCOUNT,
    public: {
      devMode: process.env.NODE_ENV !== 'production',
      ecosystem: 'misebox',
      appId: process.env.APP_ID,
      appName: 'Niederhorn',
      appShortName: 'Niederhorn',
      appDescription: 'Tenant experience for Niederhorn hospitality partners.',
      primaryColor: process.env.APP_PRIMARY_COLOR,
      neutralColor: process.env.APP_NEUTRAL_COLOR,
      secondaryColor: process.env.APP_SECONDARY_COLOR,
      centralSignupUrl: process.env.CENTRAL_SIGNUP_URL,
      appIcon: process.env.APP_ICON,
      developerPin: process.env.PIN,
      firebaseConfig: {
        apiKey: process.env.NUXT_FIREBASE_API_KEY,
        authDomain: process.env.NUXT_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NUXT_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NUXT_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NUXT_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NUXT_FIREBASE_APP_ID,
        measurementId: process.env.NUXT_FIREBASE_MEASUREMENT_ID,
      },
      appSettings: {
        appId: process.env.APP_ID,
        ecosystem: 'misebox',
        appName: 'Niederhorn',
        appShortName: 'Niederhorn',
        appDescription: 'Tenant experience for Niederhorn hospitality partners.',
      },
      modules: [
        '@nuxt/ui',
        '@nuxt/icon',
        'nuxt-vuefire',
        '@vite-pwa/nuxt',
        'fireux-core',
        'fireux-misebox',
      ],
      role: 'tenant',
      globalAppId: 'misebox-app',
    },
  },
  compatibilityDate: process.env.NUXT_COMPATIBILITY_DATE as NuxtConfig['compatibilityDate'],
  vite: {
    server: {
      fs: {
        allow: [workspaceRoot],
      },
    },
  },
  nitro: {
    preset: process.env.FIREUX_NITRO_PRESET as any,
    firebase: {
      gen: 2,
      nodeVersion: '22',
      serverFunctionName: 'niederhornServer',
      region: process.env.NITRO_FIREBASE_REGION,
    },
    externals: {
      external: [
        'firebase-admin',
        'firebase-functions',
        '@google-cloud/firestore',
        '@google-cloud/storage',
      ],
    },
  },
})
