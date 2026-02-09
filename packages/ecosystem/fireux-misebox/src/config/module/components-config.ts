import { addComponentsDir, type Resolver } from '@nuxt/kit';
import type { Nuxt } from '@nuxt/schema';
import {
    registerComponentAliases,
    registerComponentsDir,
} from 'fireux-core/config/module/module-helpers';

/**
 * Register runtime components for this module.
 */
export function configureComponents(resolver: Resolver, nuxt: Nuxt) {
  const componentsDir = registerComponentsDir(resolver, './runtime/components', {
    global: false,
    // Keep path segments in component names to avoid collisions
    // e.g. organisms/Ingredient/Profile.vue -> IngredientProfile
    pathPrefix: true,
    // Ensure ecosystem components override core defaults
    priority: 1,
  })

  if (componentsDir) {
    ;(nuxt.options.alias ||= {}) as Record<string, string>
    ;(nuxt.options.alias as Record<string, string>)['#fireux-misebox-components'] =
      componentsDir
  }

  addComponentsDir({
    path: resolver.resolve('./runtime/components/organisms/Ingredient'),
    global: true,
    pathPrefix: true,
    prefix: 'Ingredient',
  })
  registerComponentAliases(
    resolver,
    './runtime/components/organisms/Ingredient',
    'Ingredient',
    { global: true }
  )

  addComponentsDir({
    path: resolver.resolve('./runtime/components/organisms/Recipe'),
    global: true,
    pathPrefix: true,
    prefix: 'Recipe',
  })
  registerComponentAliases(
    resolver,
    './runtime/components/organisms/Recipe',
    'Recipe',
    { global: true }
  )
}