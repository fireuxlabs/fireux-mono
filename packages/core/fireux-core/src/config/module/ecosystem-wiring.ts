import { addImportsDir, type Resolver } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import { existsSync } from 'fs'
import { setRuntimeFirebaseEcosystem } from '../app/runtime'
import { configurePages } from './pages-config'

type EcosystemFirebase = {
  id: string
  name: string
  description: string
  firebase: {
    apiKey: string
    authDomain: string
    projectId: string
    storageBucket: string
    messagingSenderId: string
    databaseId?: string
    identityDatabaseId?: string
    simulationDatabaseId?: string
  }
}

type EcosystemResolverStep = (resolver: Resolver, nuxt: Nuxt) => void
type EcosystemNuxtStep = (nuxt: Nuxt) => void

export type ConfigureFireuxEcosystemModuleOptions = {
  ecosystem: EcosystemFirebase
  configureRuntimeConfig?: EcosystemNuxtStep
  configurePages?: EcosystemResolverStep
  configureComponents: EcosystemResolverStep
  configureImports?: EcosystemResolverStep
  configurePublicAssets?: EcosystemResolverStep
}

const configureDefaultImports = (resolver: Resolver) => {
  const composablesDir = resolver.resolve('./runtime/composables')
  if (!existsSync(composablesDir)) return
  addImportsDir(composablesDir)
}

const configureDefaultPublicAssets = (
  resolver: Resolver,
  nuxt: Nuxt,
  key: string,
  title: string
) => {
  const publicDir = resolver.resolve('./runtime/public')
  if (!existsSync(publicDir)) return

  const nitro = ((nuxt.options as any).nitro ||= {}) as Record<string, any>
  const publicAssets = (nitro.publicAssets ||= []) as Array<
    string | { baseURL?: string; dir: string; maxAge?: number }
  >

  const already = publicAssets.some((entry) =>
    typeof entry === 'string' ? entry === publicDir : entry?.dir === publicDir
  )
  if (!already) publicAssets.push({ dir: publicDir })

  const rc = ((nuxt.options as any).runtimeConfig ||= {}) as Record<string, any>
  const fireuxDev = (rc.fireuxDev ||= {}) as Record<string, any>
  const ecoDirs = (fireuxDev.ecosystemPublicDirs ||= []) as Array<any>
  const alreadyDev = ecoDirs.some((e) => e?.dir === publicDir)
  if (!alreadyDev) ecoDirs.push({ key, title, dir: publicDir })
}

export function configureFireuxEcosystemModule(
  resolver: Resolver,
  nuxt: Nuxt,
  options: ConfigureFireuxEcosystemModuleOptions
) {
  setRuntimeFirebaseEcosystem(nuxt as any, {
    id: options.ecosystem.id,
    name: options.ecosystem.name,
    description: options.ecosystem.description,
    firebase: {
      ...options.ecosystem.firebase,
      identityDatabaseId:
        options.ecosystem.firebase.identityDatabaseId ||
        options.ecosystem.firebase.databaseId,
    },
  })

  options.configureRuntimeConfig?.(nuxt)
  ;(options.configurePages || configurePages)(resolver, nuxt)
  options.configureComponents(resolver, nuxt)

  if (options.configureImports) {
    options.configureImports(resolver, nuxt)
  } else {
    configureDefaultImports(resolver)
  }

  if (options.configurePublicAssets) {
    options.configurePublicAssets(resolver, nuxt)
  } else {
    const key = String(options.ecosystem.name || options.ecosystem.id || 'ecosystem')
      .trim()
      .toLowerCase()
    const title = `${String(options.ecosystem.name || options.ecosystem.id || 'Ecosystem').trim()} ecosystem images`
    configureDefaultPublicAssets(resolver, nuxt, key, title)
  }
}
