import { addServerHandler } from '@nuxt/kit'
import { existsSync } from 'node:fs'

export function configureServer(resolver: any) {
  // Register only actively used server routes to keep the surface minimal
  const base = resolver.resolve('./runtime/server/api')

  // App env-check used by onboarding screens
  const envCheck = `${base}/app/env-check.ts`
  if (existsSync(envCheck)) {
    addServerHandler({ route: '/api/app/env-check', handler: envCheck })
  }

  // Dev-only tracing sink used by inject-trace.client plugin
  const injectTrace = `${base}/inject-trace.post.ts`
  if (existsSync(injectTrace)) {
    addServerHandler({ route: '/api/inject-trace', handler: injectTrace })
  }

  // Generic image proxy used by image storage and avatar displays
  const imageProxy = `${base}/proxy/image.get.ts`
  if (existsSync(imageProxy)) {
    addServerHandler({ route: '/api/proxy/image', handler: imageProxy })
  }

  // PWA manifest served dynamically to keep a single shared shape across apps
  const manifest = resolver.resolve(
    './runtime/server/manifest.webmanifest.get.ts'
  )
  if (existsSync(manifest)) {
    addServerHandler({ route: '/manifest.webmanifest', handler: manifest })
  }
}
