// FireUX app config guide: packages/core/fireux-docs/src/config/app/nuxt.config.md
import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'

export default defineFireuxConfig({
  ecosystem: 'buenohost',
  projectId: 'fireux',
  ecosystemId: 'buenohost',
  id: 'buenohost',
  name: 'BuenoHost',
  shortName: 'BuenoHost',
  brand: { owner: 'ecosystem' },
  databaseId: 'buenohost',
  role: 'global',
  pricing: {
    consoleName: 'Host Console',
    free: ['Use one Property workspace', 'Publish one guest stay guide', 'Create a guest URL and QR code', 'Manage the guide from the Host Console'],
    pro: ['Manage multiple properties and rooms', 'Publish property and room guides', 'Manage reservations and the stay calendar', 'Give the hosting team Console access'],
  },
  seo: {
    siteUrl: 'https://buenohost-app.web.app',
  },
  consoles: ['property'],
  domains: ['properties'],
  modules: ['fireux-properties', 'fireux-reservations'],
})
