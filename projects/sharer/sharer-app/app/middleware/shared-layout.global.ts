export default defineNuxtRouteMiddleware((to) => {
  if (to.path === '/shared' || to.path.startsWith('/shared/')) {
    to.meta.layout = false
  }
})
