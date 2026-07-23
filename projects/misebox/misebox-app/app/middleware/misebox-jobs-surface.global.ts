// Concurrent edit — 2026-07-23 15:48 CEST — Give the Jobs hostname a focused shell without creating a second App authority.
import {
  defineNuxtRouteMiddleware,
  navigateTo,
  useRequestURL,
} from '#imports'
import type { RouteLocationNormalized } from 'vue-router'

const JOBS_HOSTNAMES = new Set([
  'jobs.misebox.app',
  'jobs.localhost',
])

const JOBS_PUBLIC_ROUTE = /^\/(?:jobs|professionals|agents)(?:\/|$)/

export default defineNuxtRouteMiddleware((to: RouteLocationNormalized) => {
  const hostname = useRequestURL().hostname.toLowerCase()
  if (!JOBS_HOSTNAMES.has(hostname)) return

  if (to.path === '/') {
    return navigateTo('/jobs', {
      redirectCode: 302,
      replace: true,
    })
  }

  if (JOBS_PUBLIC_ROUTE.test(to.path)) {
    to.meta.layout = 'misebox-jobs'
  }
})
