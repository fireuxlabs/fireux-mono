import type { Nuxt } from '@nuxt/schema'

export const configureRuntimeConfig = (nuxt: Nuxt) => {
  const rc = ((nuxt.options as any).runtimeConfig ||= {}) as Record<string, any>
  const pub = (rc.public ||= {}) as Record<string, any>
  const fireux = (pub.fireux ||= {}) as Record<string, any>

  const currentGranite = fireux.granite

  const graniteDefaults = {
    enabled: true,
    console: {
      runtimeAnchor: 'portfolio',
      defaultMode: 'live',
      allowedModes: ['live', 'read-only'],
      selectorRoute: '/portfolios',
    },
    branding: {
      label: 'Granite',
      tagline: 'Rock Solid OS for portfolio landlords',
    },
  }

  fireux.granite = currentGranite && typeof currentGranite === 'object'
    ? { ...graniteDefaults, ...currentGranite }
    : { ...graniteDefaults }
}
