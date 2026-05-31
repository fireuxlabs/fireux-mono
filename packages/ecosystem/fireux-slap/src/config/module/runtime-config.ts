import type { Nuxt } from '@nuxt/schema'

export const configureRuntimeConfig = (nuxt: Nuxt) => {
  const rc = ((nuxt.options as any).runtimeConfig ||= {}) as Record<string, any>
  const pub = (rc.public ||= {}) as Record<string, any>
  const fireux = (pub.fireux ||= {}) as Record<string, any>

  const currentSlap = fireux.slap

  const slapDefaults = {
    enabled: true,
    branding: {
      label: 'Slap',
      tagline: 'Make it hit.',
    },
    commerceLanguage: {
      products: 'Drops',
      categories: 'Collections',
      blog: 'Stories',
      media: 'Gallery',
    },
  }

  fireux.slap = currentSlap && typeof currentSlap === 'object'
    ? { ...slapDefaults, ...currentSlap }
    : { ...slapDefaults }
}
