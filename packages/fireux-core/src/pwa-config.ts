import { addModule } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'

/**
 * Configure PWA support for FireUX apps
 * Based on @vite-pwa/nuxt for Nuxt 3 compatibility
 */
export function configurePWA(nuxt: Nuxt) {
  // Only add PWA module if not already added
  if (!nuxt.options.modules?.includes('@vite-pwa/nuxt')) {
    addModule('@vite-pwa/nuxt', {
      registerType: 'autoUpdate',
      manifest: {
        name: process.env.APP_NAME || 'FireUX App',
        short_name: process.env.APP_SHORT_NAME || 'FireUX',
        start_url: '/',
        display: 'standalone',
        theme_color: process.env.APP_THEME_COLOR || '#1f2937',
        background_color: process.env.APP_BACKGROUND_COLOR || '#ffffff',
        icons: [
          { 
            src: '/icon-192x192.png', 
            sizes: '192x192', 
            type: 'image/png',
            purpose: 'any maskable'
          },
          { 
            src: '/icon-512x512.png', 
            sizes: '512x512', 
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        navigateFallback: '/',
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        globPatterns: ['**/*.{js,css,html,png,svg,ico,json,txt,woff2}'],
        // Cache Firebase assets
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/firebaseapp\.com\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'firebase-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\//,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets'
            }
          }
        ]
      },
      devOptions: {
        enabled: process.env.NODE_ENV === 'development',
        suppressWarnings: true,
        navigateFallbackAllowlist: [/^\/$/],
        type: 'module'
      }
    })
  }

  // Add PWA-related runtime config
  nuxt.options.runtimeConfig.public = {
    ...nuxt.options.runtimeConfig.public,
    pwa: {
      enabled: true,
      appName: process.env.APP_NAME || 'FireUX App',
      appShortName: process.env.APP_SHORT_NAME || 'FireUX',
      themeColor: process.env.APP_THEME_COLOR || '#1f2937',
      backgroundColor: process.env.APP_BACKGROUND_COLOR || '#ffffff'
    }
  }

  // Log PWA configuration in development
  if (process.env.NODE_ENV === 'development') {
    console.log('🚀 FireUX PWA: Enabled for', process.env.APP_NAME || 'FireUX App')
  }
}
