import type { Resolver } from '@nuxt/kit';
import type { Nuxt } from '@nuxt/schema';
import { registerComponentsDir } from 'fireux-core/config/module/module-helpers';

/**
 * Register runtime components for this module.
 */
export function configureComponents(resolver: Resolver, _nuxt: Nuxt) {
  registerComponentsDir(resolver, './runtime/components/TemplateOne', {
    global: false,
    pathPrefix: true,
    prefix: 'TemplateOne',
    priority: 1,
  })
  registerComponentsDir(resolver, './runtime/components/layouts', {
    global: false,
    pathPrefix: true,
    prefix: 'Layouts',
    priority: 1,
  })
}
