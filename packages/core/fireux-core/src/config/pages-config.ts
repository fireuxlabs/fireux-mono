import { globSync } from 'glob'

/**
 * Configure pages for the Nuxt application
 * @param resolver The resolver instance to resolve file paths
 * @param nuxt The Nuxt instance
 */
export function configurePages(resolver: any, _nuxt: any) {
  const resolvePath = (p: string) => resolver.resolve(p)
  const pagesDir = resolvePath('./runtime/pages')
  const pageFiles = globSync('**/*.vue', {
    cwd: pagesDir,
    absolute: false,
  })
  console.log(`🔍 Found ${pageFiles.length} page files in runtime/pages/`)
  pageFiles.forEach((pageFile) => {
    const routePath = convertFilePathToRoute(pageFile)
    const pageName = convertFilePathToPageName(pageFile)
    console.log(`Discovered page: ${pageName} -> ${routePath} (${pageFile})`)
  })
}

/**
 * Convert file path to route path following Nuxt conventions
 * @param filePath - The file path relative to pages directory
 * @returns The route path
 */
function convertFilePathToRoute(filePath: string): string {
  let routePath = filePath
    .replace(/\.vue$/, '') // Remove .vue extension
    .replace(/\/index$/, '') // Remove /index
    .replace(/\[([^\]]+)\]/g, ':$1') // Convert [param] to :param

  // Handle root index
  if (routePath === 'index') {
    routePath = ''
  }

  // Ensure leading slash
  if (routePath && !routePath.startsWith('/')) {
    routePath = '/' + routePath
  }

  // Handle empty route (root)
  if (!routePath) {
    routePath = '/'
  }

  return routePath
}

/**
 * Convert file path to page name
 * @param filePath - The file path relative to pages directory
 * @returns The page name
 */
function convertFilePathToPageName(filePath: string): string {
  return filePath
    .replace(/\.vue$/, '') // Remove .vue extension
    .replace(/\[([^\]]+)\]/g, '$1') // Convert [param] to param
    .replace(/\//g, '-') // Convert slashes to dashes
    .replace(/(^-+)|(-+$)/g, '') // Remove leading/trailing dashes
    .toLowerCase()
}
