import { defineNuxtRouteMiddleware } from '#imports'
import type { RouteLocationNormalized } from 'vue-router'

const INTERLAKEN_JOBS_PUBLIC_ROUTE =
  /^\/(?:jobs|professionals|agents)(?:\/|$)/

export default defineNuxtRouteMiddleware((to: RouteLocationNormalized) => {
  if (INTERLAKEN_JOBS_PUBLIC_ROUTE.test(to.path)) {
    to.meta.layout = 'marketplace'
  }
})
