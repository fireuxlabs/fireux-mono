export default defineNuxtConfig({
  extends: ['@nuxt/ui-pro'],
  modules: ['@nuxt/ui', 'fireux-core', 'fireux-places'],
  fireuxPlaces: {
    googlePlacesApiKey: process.env.GOOGLE_PLACES_API_KEY,
    defaultCountry: 'US',
    enableAutocomplete: true,
  },
})
