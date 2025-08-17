import { addServerHandler } from '@nuxt/kit'

/**
 * Configure server-side functionality for the Nuxt application
 * @param resolver The resolver instance to resolve file paths
 */
export function configureServer(resolver: any) {
  const resolvePath = (p: string) => resolver.resolve(p)

  // App metadata and configuration APIs
  addServerHandler({
    route: '/api/app',
    handler: resolvePath('./runtime/server/api/app.get'),
  })

  addServerHandler({
    route: '/api/app/theme',
    handler: resolvePath('./runtime/server/api/app/theme.get'),
  })

  addServerHandler({
    route: '/api/app/env-check',
    handler: resolvePath('./runtime/server/api/app/env-check'),
  })

  addServerHandler({
    route: '/api/app/ensure-app',
    method: 'post',
    handler: resolvePath('./runtime/server/api/app/ensure-app.post'),
  })

  // Utility endpoints
  addServerHandler({
    route: '/api/proxy/google-avatar',
    handler: resolvePath('./runtime/server/api/proxy/google-avatar'),
  })

  // Firestore endpoints
  addServerHandler({
    route: '/api/firestore/update-document',
    method: 'post',
    handler: resolvePath('./runtime/server/api/firestore/update-document.post'),
  })

  // Stripe endpoints
  addServerHandler({
    route: '/api/stripe/create-product',
    method: 'post',
    handler: resolvePath('./runtime/server/api/stripe/create-product.post'),
  })

  addServerHandler({
    route: '/api/stripe/create-subscription',
    method: 'post',
    handler: resolvePath(
      './runtime/server/api/stripe/create-subscription.post'
    ),
  })
}
