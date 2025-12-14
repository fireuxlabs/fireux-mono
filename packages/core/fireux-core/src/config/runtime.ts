import type { NuxtConfig } from 'nuxt/schema'

export type FireUXRuntimePublic = {
  id: string
  name: string
  shortName: string
  description: string
  domain: string
  role: 'global' | 'tenant'
  ecosystem: string
  modules: readonly string[]
  appIcon?: string
  primaryColor?: string
  neutralColor?: string
  secondaryColor?: string
  centralSignupUrl?: string
  globalAppId?: string
  developerPin?: string
}

export function configRuntime(nuxt: NuxtConfig, c: FireUXRuntimePublic) {
  const runtimeConfig = (nuxt.runtimeConfig ||= {} as any)
  const pub = (runtimeConfig.public ||= {} as any)

  // Canonical shape ONLY
  pub.fireux = {
    id: c.id,
    name: c.name,
    shortName: c.shortName,
    description: c.description,
    domain: c.domain,
    role: c.role,
    ecosystem: c.ecosystem,
    modules: [...c.modules],
    appIcon: c.appIcon,
    primaryColor: c.primaryColor,
    neutralColor: c.neutralColor,
    secondaryColor: c.secondaryColor,
    centralSignupUrl: c.centralSignupUrl,
    globalAppId: c.globalAppId,
    developerPin: c.developerPin,
  }
}
