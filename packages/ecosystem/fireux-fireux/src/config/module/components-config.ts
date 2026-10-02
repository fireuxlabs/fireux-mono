import { addComponent, type Resolver } from '@nuxt/kit';
import type { Nuxt } from '@nuxt/schema';
import { registerComponentsDir } from 'fireux-core/config/module/module-helpers';

/**
 * Register runtime components for this module.
 */
export function configureComponents(resolver: Resolver, nuxt: Nuxt) {
  const componentsDir = registerComponentsDir(resolver, './runtime/components', {
    global: false,
    pathPrefix: true,
    // Ensure ecosystem components override core defaults
    priority: 1,
  })

  registerComponentsDir(resolver, './runtime/project/components/Workspace', {
    global: false,
    pathPrefix: true,
    prefix: 'WorkspaceProject',
    priority: 20,
    ignore: ['Navigation.vue'],
  })

  addComponent({
    name: 'WorkspaceProjectNavigation',
    filePath: resolver.resolve(
      './runtime/project/components/Workspace/Navigation.vue'
    ),
    global: true,
  })

  registerComponentsDir(resolver, './runtime/project/components', {
    global: false,
    pathPrefix: true,
    prefix: 'Project',
    ignore: ['Workspace/**'],
  })

  if (!componentsDir) return

  ;(nuxt.options.alias ||= {}) as Record<string, string>
  ;(nuxt.options.alias as Record<string, string>)['#fireux-fireux-components'] =
    componentsDir
}