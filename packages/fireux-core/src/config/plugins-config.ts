import { addPlugin } from '@nuxt/kit'
import { glob } from 'glob'
import path from 'path'

/**
 * Configure plugins for the Nuxt application
 * @param resolver The resolver instance to resolve file paths
 */
export function configurePlugins(resolver: any) {
  const resolvePath = (p: string) => resolver.resolve(p)

  // Get the absolute path to the runtime/plugins directory
  const pluginsDir = resolvePath('./runtime/plugins')

  // Find all plugin files in the plugins directory
  const pluginFiles = glob.sync('**/*.{js,ts}', { cwd: pluginsDir })

  // Register all discovered plugins
  pluginFiles.forEach((file: string) => {
    const pluginPath = path.join(pluginsDir, file)

    // Determine mode based on file extension
    let mode: 'client' | 'server' | undefined
    if (file.includes('.client.')) {
      mode = 'client'
    } else if (file.includes('.server.')) {
      mode = 'server'
    }

    console.log(
      `Auto-registering plugin: ${file} (mode: ${mode || 'universal'})`
    )

    addPlugin({
      src: pluginPath,
      mode,
    })
  })

  // Register Firebase client plugin (special case)
  const firebaseClientPath = resolvePath('./runtime/firebase.client')
  console.log('Registering Firebase client plugin')
  addPlugin({
    src: firebaseClientPath,
    mode: 'client',
  })
}
