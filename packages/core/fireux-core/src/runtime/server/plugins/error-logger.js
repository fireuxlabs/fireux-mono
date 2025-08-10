export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('error', (err) => {
    // eslint-disable-next-line no-console
    console.error('[NitroError]', err)
  })
})
