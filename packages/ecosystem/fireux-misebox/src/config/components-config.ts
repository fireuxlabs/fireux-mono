import { addComponentsDir, type Resolver } from '@nuxt/kit';
import type { Nuxt } from '@nuxt/schema';
import { existsSync } from 'node:fs';

/**
 * Register runtime components for this module.
 */
export function configureComponents(resolver: Resolver, nuxt: Nuxt) {
  const componentsDir = resolver.resolve('./runtime/components')
  if (existsSync(componentsDir)) {
    ;(nuxt.options.alias ||= {}) as Record<string, string>
    ;(nuxt.options.alias as Record<string, string>)['#fireux-misebox-components'] =
      componentsDir

    addComponentsDir({
      path: componentsDir,
      pattern: '**/*.vue',
      global: false,
      // Keep path segments in component names to avoid collisions
      // e.g. organisms/entities/Ingredient/Profile.vue -> IngredientProfile
      pathPrefix: true,
      // Ensure ecosystem components override core defaults
      priority: 1,
    })
  }

  addComponentsDir({
    path: resolver.resolve('./runtime/components/organisms/entities/Ingredient'),
    global: true,
    pathPrefix: true,
    prefix: 'Ingredient',
  })

  addComponentsDir({
    path: resolver.resolve('./runtime/components/organisms/entities/Recipe'),
    global: true,
    pathPrefix: true,
    prefix: 'Recipe',
  })
}
