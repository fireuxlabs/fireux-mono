import { addPlugin } from '@nuxt/kit'

/**
 * Configure plugins for the Nuxt application
 * @param resolver The resolver instance to resolve file paths
 */
export function configurePlugins(resolver: any) {
  const resolvePath = (p: string) => resolver.resolve(p)

  // Register Firebase client plugin
  addPlugin({
    src: resolvePath('./runtime/firebase.client.ts'),
    mode: 'client',
  })
}
