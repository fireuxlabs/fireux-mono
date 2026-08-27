import type { Nuxt } from '@nuxt/schema'

export const configureRuntimeConfig = (nuxt: Nuxt) => {
  const rc = ((nuxt.options as any).runtimeConfig ||= {}) as Record<string, any>
  const sharer = (rc.sharer ||= {}) as Record<string, any>
  const pub = (rc.public ||= {}) as Record<string, any>
  const fireux = (pub.fireux ||= {}) as Record<string, any>

  const currentEcosystem = fireux['sharer']

  sharer.youtubeApiKey ||= ''

  const ecosystemDefaults = {
    enabled: true,
    branding: {
      label: 'Sharer',
      tagline: 'Your links, ready to share.',
    },
  }

  fireux['sharer'] = currentEcosystem && typeof currentEcosystem === 'object'
    ? { ...ecosystemDefaults, ...currentEcosystem }
    : { ...ecosystemDefaults }
}
