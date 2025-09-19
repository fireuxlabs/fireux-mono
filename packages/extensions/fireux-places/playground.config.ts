import { defineNuxtConfig } from 'nuxt/config'
export default defineNuxtConfig({
  modules: [
    '@nuxt/ui',
    'fireux-core',
    [
      'fireux-places',
      {
        googlePlacesApiKey: process.env.GOOGLE_PLACES_API_KEY,
        defaultCountry: 'US',
        enableAutocomplete: true,
      },
    ],
  ],
})
