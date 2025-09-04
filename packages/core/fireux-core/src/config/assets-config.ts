/**
 * Configure public assets for the Nuxt application
 * @param resolver The resolver instance to resolve file paths
 * @param nuxt The Nuxt instance
 */
export function configureAssets(resolver: any, nuxt: any) {
  const resolvePath = (p: string) => resolver.resolve(p)

  // Add CSS files to Nuxt automatically
  nuxt.options ||= {}
  if (!nuxt.options.css) nuxt.options.css = []
  const css = nuxt.options.css as string[]
  const mainCssPath = resolvePath('./runtime/assets/styles/main.css')
  const mainScssPath = resolvePath('./runtime/assets/styles/scss/main.scss')

  // Ensure Tailwind/NUXT UI base first (main.css)
  if (!css.some((s) => String(s).includes('runtime/assets/styles/main.css'))) {
    css.push(mainCssPath)
  }
  // Then FireUX SCSS system
  if (!css.some((s) => String(s).includes('runtime/assets/styles/scss/main.scss'))) {
    css.push(mainScssPath)
  }

  // Configure Nitro to serve public assets from the package
  nuxt.options.nitro ||= {}
  nuxt.options.nitro.publicAssets ||= []
  nuxt.options.nitro.publicAssets.push({
    baseURL: '/',
    dir: resolvePath('./runtime/public'),
    maxAge: 60 * 60 * 24 * 7, // 7 days cache
  })

  // Expose public directory and assets directory for advanced usage
  nuxt.options.alias ||= {}
  nuxt.options.alias['#fireux-core-public'] = resolvePath('./runtime/public')
  nuxt.options.alias['#fireux-core-assets'] = resolvePath('./runtime/assets')
}
