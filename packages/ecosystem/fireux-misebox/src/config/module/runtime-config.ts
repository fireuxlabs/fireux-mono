import type { Nuxt } from '@nuxt/schema'
import { getPlacesConfig } from './places-config'

const getJobsConfig = () => ({
  enabled: true,
  placeCollections: ['kitchens', 'companies'],
})

export const configureRuntimeConfig = (nuxt: Nuxt) => {
  const rc = ((nuxt.options as any).runtimeConfig ||= {}) as Record<string, any>
  const pub = (rc.public ||= {}) as Record<string, any>
  const fireux = (pub.fireux ||= {}) as Record<string, any>

  const currentPlaces = fireux.places
  const currentJobs = fireux.jobs
  const currentProducts = fireux.products
  const currentBlogs = fireux.blogs

  const placeDefaults = getPlacesConfig()
  const jobDefaults = getJobsConfig()
  const productDefaults = { enabled: true }
  const blogDefaults = { enabled: true }

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
}
