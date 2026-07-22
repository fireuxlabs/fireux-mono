// Concurrent edit — 2026-07-22 12:37 CEST — Shared Job spine alignment: retain placeCollections only for Professional Experience materialization.
import type { Nuxt } from '@nuxt/schema'
import { getPlacesConfig } from './places-config'

const getJobsConfig = () => ({
  enabled: true,
  placeCollections: ['kitchens', 'companies'],
})

const asRecord = (value: unknown): Record<string, any> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, any>)
    : {}

export const configureRuntimeConfig = (nuxt: Nuxt) => {
  const rc = ((nuxt.options as any).runtimeConfig ||= {}) as Record<string, any>
  const pub = (rc.public ||= {}) as Record<string, any>
  const fireux = (pub.fireux ||= {}) as Record<string, any>
  const modules = new Set(
    Array.isArray(fireux.modules)
      ? fireux.modules.map((value: unknown) => String(value || '').trim())
      : []
  )
  const hasModule = (name: string) => modules.has(name)

  const currentPlaces = fireux.places
  const currentJobs = fireux.jobs
  const currentProducts = fireux.products
  const currentBlogs = fireux.blogs
  const currentSproochli = asRecord(fireux.sproochli)
  const currentDesignPacks = asRecord(fireux.designPacks)

  const placeDefaults = getPlacesConfig()
  const jobDefaults = getJobsConfig()
  const productDefaults = { enabled: true }
  const blogDefaults = { enabled: true }
  if (hasModule('fireux-places')) {
    fireux.places = currentPlaces && typeof currentPlaces === 'object'
      ? { ...placeDefaults, ...currentPlaces }
      : { ...placeDefaults }
  }

  if (hasModule('fireux-jobs')) {
    fireux.jobs = currentJobs && typeof currentJobs === 'object'
      ? { ...jobDefaults, ...currentJobs }
      : { ...jobDefaults }
  }

  if (hasModule('fireux-products')) {
    fireux.products = currentProducts && typeof currentProducts === 'object'
      ? { ...productDefaults, ...currentProducts }
      : { ...productDefaults }
  }

  if (hasModule('fireux-blogs')) {
    fireux.blogs = currentBlogs && typeof currentBlogs === 'object'
      ? { ...blogDefaults, ...currentBlogs }
      : { ...blogDefaults }
  }

  if (hasModule('fireux-sproochli')) {
    fireux.sproochli = {
      installed: true,
      enabled: true,
      ...currentSproochli,
    }
  }

  if (hasModule('fireux-kitchens')) {
    fireux.designPacks = {
      ...currentDesignPacks,
      publicMenu: {
        preset: 'classic',
        ...asRecord(currentDesignPacks.publicMenu),
      },
    }
  }
}
