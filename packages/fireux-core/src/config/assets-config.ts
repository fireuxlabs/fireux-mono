/**
 * Configure public assets for the Nuxt application
 * @param resolver The resolver instance to resolve file paths
 * @param nuxt The Nuxt instance
 */
export function configureAssets(resolver: any, nuxt: any) {
  const resolvePath = (p: string) => resolver.resolve(p)

  // Add CSS files to Nuxt automatically - this makes the module truly sovereign
  const mainCssPath = resolvePath('./runtime/assets/styles/main.css')
  const mainScssPath = resolvePath('./runtime/assets/styles/main.scss')

  // Register CSS with Nuxt automatically
  nuxt.options.css = nuxt.options.css || []
  // Add both CSS and SCSS - the CSS for immediate use, SCSS for compilation
  nuxt.options.css.push(mainCssPath)
  nuxt.options.css.push(mainScssPath)

  // Expose public directory and assets directory for advanced usage
  nuxt.options.alias = nuxt.options.alias || {}
  nuxt.options.alias['#fireux-core-public'] = resolvePath('./runtime/public')
  nuxt.options.alias['#fireux-core-assets'] = resolvePath('./runtime/assets')
}
