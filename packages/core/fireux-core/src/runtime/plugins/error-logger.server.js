export default defineNuxtPlugin(() => {
  const nitro = useNitroApp()
  nitro.hooks.hook('error', (err) => {
    // eslint-disable-next-line no-console
    console.error('[NitroError]', err)
  })
})
