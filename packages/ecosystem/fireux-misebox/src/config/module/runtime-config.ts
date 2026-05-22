import type { Nuxt } from '@nuxt/schema'
import { getPlacesConfig } from './places-config'

const getJobsConfig = () => ({
  enabled: true,
  placeCollections: ['kitchens', 'companies'],
})

const getPublicMenuDefaults = (appId: string) => {
  if (appId === 'la-tap-berne') {
    return {
      kitchenCollectionPath: 'kitchens',
      kitchenId: 'la-tapberne',
      menuId: 'main',
      sproochli: true,
    }
  }

  return {}
}

const asRecord = (value: unknown): Record<string, any> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, any>)
    : {}

export const configureRuntimeConfig = (nuxt: Nuxt) => {
  const rc = ((nuxt.options as any).runtimeConfig ||= {}) as Record<string, any>
  const pub = (rc.public ||= {}) as Record<string, any>
  const fireux = (pub.fireux ||= {}) as Record<string, any>

  const currentPlaces = fireux.places
  const currentJobs = fireux.jobs
  const currentProducts = fireux.products
  const currentBlogs = fireux.blogs
  const currentMisebox = asRecord(fireux.misebox)
  const currentSproochli = asRecord(fireux.sproochli)
  const currentDesignPacks = asRecord(fireux.designPacks)

  const placeDefaults = getPlacesConfig()
  const jobDefaults = getJobsConfig()
  const productDefaults = { enabled: true }
  const blogDefaults = { enabled: true }
  const publicMenuDefaults = getPublicMenuDefaults(String(fireux.id || '').trim())

  fireux.places = currentPlaces && typeof currentPlaces === 'object'
    ? { ...placeDefaults, ...currentPlaces }
    : { ...placeDefaults }

  fireux.jobs = currentJobs && typeof currentJobs === 'object'
    ? { ...jobDefaults, ...currentJobs }
    : { ...jobDefaults }

  fireux.products = currentProducts && typeof currentProducts === 'object'
    ? { ...productDefaults, ...currentProducts }
    : { ...productDefaults }

  fireux.blogs = currentBlogs && typeof currentBlogs === 'object'
    ? { ...blogDefaults, ...currentBlogs }
    : { ...blogDefaults }

  fireux.sproochli = {
    installed: true,
    enabled: true,
    ...currentSproochli,
  }

  fireux.designPacks = {
    publicMenu: {
      preset: 'classic',
    },
    ...currentDesignPacks,
  }

  fireux.misebox = {
    ...currentMisebox,
    publicMenu: {
      ...publicMenuDefaults,
      ...asRecord(currentMisebox.publicMenu),
    },
  }
}
