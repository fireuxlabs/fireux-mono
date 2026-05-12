import { abortNavigation, createError, defineNuxtRouteMiddleware } from '#imports'

function isDevPath(path: string) {
  return path === '/dev' || path.startsWith('/dev/')
}

export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.dev) return

  const path = String(to.path || '')
  if (!isDevPath(path)) return

  return abortNavigation(
    createError({
      statusCode: 404,
      statusMessage: 'Not found',
    })
  )
})
