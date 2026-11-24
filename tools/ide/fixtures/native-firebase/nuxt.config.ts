export default defineNuxtConfig({
  devtools: { enabled: false },
  runtimeConfig: { public: { ecosystem: { databaseId: 'probe' } } },
})
