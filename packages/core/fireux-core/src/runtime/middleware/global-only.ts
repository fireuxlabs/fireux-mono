import { defineNuxtRouteMiddleware, navigateTo, useRuntimeConfig } from '#app'

export default defineNuxtRouteMiddleware(() => {
  const role = useRuntimeConfig().public?.role
  if (role === 'global') return

  if (process.server) {
    return createError({ statusCode: 404, statusMessage: 'Not Found' })
  }

  return navigateTo('/')
})
