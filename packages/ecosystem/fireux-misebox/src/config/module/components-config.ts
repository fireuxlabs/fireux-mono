import type { Resolver } from '@nuxt/kit';
import type { Nuxt } from '@nuxt/schema';
import { registerComponentsDir } from 'fireux-core/config/module/module-helpers';

/**
 * Register runtime components for this module.
 */
export function configureComponents(resolver: Resolver, nuxt: Nuxt) {
  const componentsDir = registerComponentsDir(resolver, './runtime/components', {
    global: false,
    // Keep path segments in component names to avoid collisions.
    // e.g. Recipe/Profile.vue -> RecipeProfile
    pathPrefix: true,
    // Ensure ecosystem components override core defaults
    priority: 1,
  })

  if (componentsDir) {
    ;(nuxt.options.alias ||= {}) as Record<string, string>
    ;(nuxt.options.alias as Record<string, string>)['#fireux-misebox-components'] =
      componentsDir
  }

}
