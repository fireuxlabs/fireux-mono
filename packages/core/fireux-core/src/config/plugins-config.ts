import { addPlugin } from '@nuxt/kit'
import { glob } from 'glob'
import path from 'path'

/**
 * Configure plugins for the Nuxt application
 * @param resolver The resolver instance to resolve file paths
 */
export function configurePlugins(resolver: any) {
  const resolvePath = (p: string) => resolver.resolve(p)

  const pluginDirs = [resolvePath('./runtime/plugins')]

  pluginDirs.forEach((pluginsDir: string) => {
    const pluginFiles = glob.sync('**/*.{js,ts}', { cwd: pluginsDir })

    pluginFiles.forEach((file: string) => {
      const pluginPath = path.join(pluginsDir, file)

      let mode: 'client' | 'server' | undefined
      if (file.includes('.client.')) mode = 'client'
      else if (file.includes('.server.')) mode = 'server'
      // infer mode from filename suffix; universal when none

      console.log(
        `Auto-registering plugin: ${file} from ${pluginsDir} (mode: ${
          mode || 'universal'
        })`
      )

      addPlugin({ src: pluginPath, mode })
    })
  })
}
