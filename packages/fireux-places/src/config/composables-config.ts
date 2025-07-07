import { addImports } from '@nuxt/kit'
import type { Resolver } from '@nuxt/kit'
import type { ModuleOptions } from '../module'
import { glob } from 'glob'

export async function configureComposables(
  resolver: Resolver,
  options: ModuleOptions
) {
  try {
    // Get all composable files
    const composableFiles = await glob('**/*.ts', {
      cwd: resolver.resolve('./runtime/composables'),
      absolute: false,
    })

    // Register each composable
    for (const file of composableFiles) {
      const composablePath = resolver.resolve('./runtime/composables', file)
      const composableName = generateComposableName(file)

      addImports({
        name: composableName,
        from: composablePath,
      })
    }
  } catch (error) {
    console.warn('FireUX Places: No composables directory found')
  }
}

function generateComposableName(filePath: string): string {
  // Extract the filename without extension
  const fileName = filePath.split('/').pop()?.replace(/\.ts$/, '') || ''

  // If it starts with 'use', return as-is, otherwise prepend 'use'
  if (fileName.startsWith('use')) {
    return fileName
  }

  // Convert to camelCase and prepend 'use'
  const camelCase = fileName.charAt(0).toUpperCase() + fileName.slice(1)
  return `use${camelCase}`
}
