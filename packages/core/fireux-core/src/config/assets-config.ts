/**
 * Configure public assets for the Nuxt application
 * @param resolver The resolver instance to resolve file paths
 * @param nuxt The Nuxt instance
 */
import { resolveModule } from '@nuxt/kit'

export function configureAssets(resolver: any, nuxt: any) {
  const resolvePath = (p: string) => resolver.resolve(p)

  // Add CSS files to Nuxt automatically - this makes the module truly sovereign
  const mainCssPath = resolvePath('./runtime/assets/styles/main.css')
  // Register CSS with Nuxt automatically
  // Add main CSS (which imports our SCSS organisms)
  nuxt.options.css = nuxt.options.css || []
  nuxt.options.css.push(mainCssPath)

  // Configure Nitro to serve public assets from the package
  nuxt.options.nitro = nuxt.options.nitro || {}
  nuxt.options.nitro.publicAssets = nuxt.options.nitro.publicAssets || []
  // Add fireux-core public directory to Nitro's public assets
  nuxt.options.nitro.publicAssets.push({
    baseURL: '/',
    dir: resolvePath('./runtime/public'),
    maxAge: 60 * 60 * 24 * 7, // 7 days cache
  })

  // Expose public directory and assets directory for advanced usage
  nuxt.options.alias = nuxt.options.alias || {}
  nuxt.options.alias['#fireux-core-public'] = resolvePath('./runtime/public')
  nuxt.options.alias['#fireux-core-assets'] = resolvePath('./runtime/assets')

  // Ensure Tailwind resolves from the app/root even when imported from core CSS
  try {
    const twPath = resolveModule('tailwindcss', {
      paths: [nuxt.options.rootDir],
    })
    if (twPath) {
      nuxt.options.alias['tailwindcss'] = twPath
    }
  } catch {
    // leave alias unset if tailwind isn't installed; Nuxt UI may still work without Tailwind
  }
}
