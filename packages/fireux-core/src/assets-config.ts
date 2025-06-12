/**
 * Configure public assets for the Nuxt application
 * @param resolver The resolver instance to resolve file paths
 * @param nuxt The Nuxt instance
 */
export function configureAssets(resolver: any, nuxt: any) {
  const resolvePath = (p: string) => resolver.resolve(p)

  // Expose public directory
  nuxt.options.alias['#fireux-core-public'] = resolvePath('./runtime/public')

  // Expose assets directory for CSS imports
  nuxt.options.alias['fireux-core/assets'] = resolvePath('./runtime/assets')

  nuxt.hook(
    'nitro:config',
    (config: { publicAssets?: Array<{ dir: string; baseURL: string }> }) => {
      config.publicAssets = config.publicAssets || []

      // Ensure CSS directory is exposed
      config.publicAssets.push({
        dir: resolvePath('./runtime/assets/css'),
        baseURL: '/fireux-core/assets/css',
      })

      // Also expose other assets
      config.publicAssets.push({
        dir: resolvePath('./runtime/assets'),
        baseURL: '/fireux-core/assets',
      })

      // Expose public directory for images and static files
      config.publicAssets.push({
        dir: resolvePath('./runtime/public'),
        baseURL: '/fireux-core',
      })
    }
  )
}
