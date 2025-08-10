export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('vue:error', (err) => {
    // eslint-disable-next-line no-console
    console.error('[VueError]', err)
  })
  nuxtApp.hook('app:error', (err) => {
    // eslint-disable-next-line no-console
    console.error('[AppError]', err)
  })
})
