import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'

export default defineFireuxConfig({
  ecosystem: 'misebox',
  projectId: 'misebox',
  ecosystemId: 'misebox',
  id: 'la-tap-berne',
  name: 'La Tap Berne',
  shortName: 'La Tap Berne',
  role: 'tenant',
  seo: {
    siteUrl: 'https://tapberne.misebox.app',
  },
  workspaces: ['kitchen'],
  workspaceConfig: {
    kitchen: {
      canCreate: false,
    },
  },
  navHiddenKeys: ['kitchens', 'places'],
  modules: ['fireux-places', 'fireux-go-qr'],
})
