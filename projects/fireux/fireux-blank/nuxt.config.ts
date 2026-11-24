export default defineNuxtConfig({
  modules: ['@nuxt/ui'],
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    public: {
      firebase: {
        apiKey: '',
        appId: '',
        projectId: '',
        databaseId: '',
        emulatorHost: '',
        emulatorPort: '',
      },
    },
  },
})
