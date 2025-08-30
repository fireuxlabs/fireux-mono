import { addPlugin } from '@nuxt/kit'
import { existsSync } from 'node:fs'
export function configurePlugins(resolver: any) {
  const client = resolver.resolve('../runtime/plugins/firebase.client.ts')
  if (existsSync(client)) addPlugin({ src: client, mode: 'client' })
}
