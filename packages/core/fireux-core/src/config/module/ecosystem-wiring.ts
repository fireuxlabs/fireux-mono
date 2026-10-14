import type { Resolver } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import { existsSync } from 'fs'
import type { FireuxEcosystemConfig } from '../../types/ecosystem'
import { setRuntimeFirebaseEcosystem } from '../app/runtime'
import { registerComposablesDir, registerLayoutComponents } from './module-helpers'
import { configurePages } from './pages-config'

type EcosystemResolverStep = (resolver: Resolver, nuxt: Nuxt) => void
type EcosystemNuxtStep = (nuxt: Nuxt) => void

export type ConfigureFireuxEcosystemModuleOptions = {
  ecosystem: FireuxEcosystemConfig
  configureRuntimeConfig?: EcosystemNuxtStep
  configurePages?: EcosystemResolverStep
  configureComponents?: EcosystemResolverStep
  configurePublicAssets?: EcosystemResolverStep
}

const configureDefaultPublicAssets = (
  resolver: Resolver,
  nuxt: Nuxt
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

}

export function configureFireuxEcosystemModule(
  resolver: Resolver,
  nuxt: Nuxt,
  options: ConfigureFireuxEcosystemModuleOptions
) {
  const ssrRegion = String(options.ecosystem.ssr.region || '').trim()
  if (!ssrRegion) {
    throw new Error('[fireux] ecosystem.ssr.region must be a non-empty region.')
  }
  const serviceAccount = String(
    options.ecosystem.ssr.serviceAccount || ''
  ).trim()
  if (
    serviceAccount &&
    !/^[a-z][a-z0-9-]{4,28}[a-z0-9]@[a-z][a-z0-9-]{4,28}[a-z0-9]\.iam\.gserviceaccount\.com$/i.test(
      serviceAccount
    )
  ) {
    throw new Error(
      '[fireux] ecosystem.ssr.serviceAccount must be an exact Google service-account email.'
    )
  }

  const nitro = ((nuxt.options as any).nitro ||= {}) as Record<string, any>
  const firebase = (nitro.firebase ||= {}) as Record<string, any>
  const httpsOptions = (firebase.httpsOptions ||= {}) as Record<string, any>
  httpsOptions.region = ssrRegion
  if (serviceAccount) {
    httpsOptions.serviceAccount = serviceAccount
  } else {
    delete httpsOptions.serviceAccount
  }

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
  options.configureComponents?.(resolver, nuxt)
  registerLayoutComponents(resolver)
  registerComposablesDir(resolver)

  if (options.configurePublicAssets) {
    options.configurePublicAssets(resolver, nuxt)
  } else {
    configureDefaultPublicAssets(resolver, nuxt)
  }
}
