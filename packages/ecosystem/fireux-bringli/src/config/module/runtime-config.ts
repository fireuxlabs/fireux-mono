import type { Nuxt } from '@nuxt/schema'

export const configureRuntimeConfig = (nuxt: Nuxt) => {
  const rc = ((nuxt.options as any).runtimeConfig ||= {}) as Record<string, any>
  const pub = (rc.public ||= {}) as Record<string, any>
  const fireux = (pub.fireux ||= {}) as Record<string, any>

  const currentDrop = fireux.drop
  const currentPlaces = fireux.places

  const dropDefaults = { enabled: true }
  const placesDefaults = { enabled: true }

  fireux.drop = currentDrop && typeof currentDrop === 'object'
    ? { ...dropDefaults, ...currentDrop }
    : { ...dropDefaults }

  fireux.places = currentPlaces && typeof currentPlaces === 'object'
    ? { ...placesDefaults, ...currentPlaces }
    : { ...placesDefaults }
}
