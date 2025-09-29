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

  // Stripe product creation used by Product Create flow
  const stripeCreateProduct = `${base}/stripe/create-product.post.ts`
  if (existsSync(stripeCreateProduct)) {
    addServerHandler({
      route: '/api/stripe/create-product',
      handler: stripeCreateProduct,
    })
  }
}
