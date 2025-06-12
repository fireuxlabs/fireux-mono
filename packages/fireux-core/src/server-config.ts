import { addServerHandler } from '@nuxt/kit'

/**
 * Configure server-side functionality for the Nuxt application
 * @param resolver The resolver instance to resolve file paths
 */
export function configureServer(resolver: any) {
  const resolvePath = (p: string) => resolver.resolve(p)

  // Register API routes
  addServerHandler({
    route: '/api/env-check',
    handler: resolvePath('./runtime/server/api/env-check'),
  })

  // Add Google avatar proxy endpoint
  addServerHandler({
    route: '/api/proxy/google-avatar',
    handler: resolvePath('./runtime/server/api/proxy/google-avatar'),
  })

  // Additional server handlers can be added here as the module grows
}
