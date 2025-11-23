/**
 * Expose Misebox public assets (brand, marketing, etc.) to Nuxt.
 */
export function configureAssets(resolver: any, nuxt: any) {
  const resolvePath = (p: string) => resolver.resolve(p)

  nuxt.options ||= {}
  nuxt.options.nitro ||= {}
  nuxt.options.nitro.publicAssets ||= []
  nuxt.options.nitro.publicAssets.push({
    baseURL: '/',
    dir: resolvePath('./runtime/public'),
    maxAge: 60 * 60 * 24 * 7,
  })

  nuxt.options.alias ||= {}
  nuxt.options.alias['#fireux-misebox-public'] = resolvePath('./runtime/public')
}
