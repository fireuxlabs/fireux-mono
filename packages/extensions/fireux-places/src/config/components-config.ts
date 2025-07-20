import { addComponent } from '@nuxt/kit'
import type { Resolver } from '@nuxt/kit'
import type { ModuleOptions } from '../module'
import { glob } from 'glob'
import { resolve } from 'path'

export async function configureComponents(
  resolver: Resolver,
  options: ModuleOptions
) {
  // Get all component files
  const componentFiles = await glob('**/*.vue', {
    cwd: resolver.resolve('./runtime/components'),
    absolute: false,
  })

  // Register each component
  for (const file of componentFiles) {
    const componentPath = resolver.resolve('./runtime/components', file)
    const componentName = generateComponentName(file)

    addComponent({
      name: componentName,
      filePath: componentPath,
    })
  }
}

function generateComponentName(filePath: string): string {
  // Remove .vue extension and convert path to PascalCase
  const withoutExtension = filePath.replace(/\.vue$/, '')
  const parts = withoutExtension.split('/')

  // Create component name with Fire prefix and namespace
  const pascalCaseName = parts
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')

  return `Fire${pascalCaseName}`
}
