import { extendPages } from '@nuxt/kit'
import { globSync } from 'glob'
import { resolve } from 'path'

/**
 * Pages Configuration for FireUX Misebox
 *
 * Auto-discovers and registers all pages using glob patterns
 */
export function configurePages(resolver: any, _nuxt: any) {
  const resolvePath = (p: string) => resolver.resolve(p)

  // Get the runtime pages directory
  const pagesDir = resolvePath('./runtime/pages')

  // Find all .vue files in the pages directory recursively
  const pageFiles = globSync('**/*.vue', {
    cwd: pagesDir,
    absolute: false,
  })

  console.log(
    `🔍 Found ${pageFiles.length} page files in misebox runtime/pages/`
  )

  // Extend pages to include all discovered pages
  extendPages((pages) => {
    pageFiles.forEach((pageFile) => {
      const resolvedPath = resolve(pagesDir, pageFile)

      // Convert file path to route path
      const routePath = convertFilePathToRoute(pageFile)

      // Generate page name from file path
      const pageName = convertFilePathToPageName(pageFile)

      console.log(`📄 Misebox page: ${pageName} -> ${routePath} (${pageFile})`)

      pages.push({
        name: pageName,
        path: routePath,
        file: resolvedPath,
      })
    })
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
