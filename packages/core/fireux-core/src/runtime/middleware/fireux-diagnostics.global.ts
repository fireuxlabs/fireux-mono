import {
  abortNavigation,
  createError,
  defineNuxtRouteMiddleware,
} from '#imports'
import { enforceClientRouteAuth } from '../composables/navigation/route-auth'

export default defineNuxtRouteMiddleware((to) => {
  if (to.path !== '/diagnostics' && !to.path.startsWith('/diagnostics/')) return
  if (!import.meta.dev)
    return abortNavigation(
      createError({ statusCode: 404, statusMessage: 'Not found' })
    )
  return enforceClientRouteAuth(to, {
    requiresAuth: true,
    roles: ['developer'],
  })
})
