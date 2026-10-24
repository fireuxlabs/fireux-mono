import { addComponent, type Resolver } from '@nuxt/kit';
import { registerComponentsDir } from 'fireux-core/config/module/module-helpers';

/**
 * Register runtime components for this module.
 */
export function configureComponents(resolver: Resolver) {
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

}
