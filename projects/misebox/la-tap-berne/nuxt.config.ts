import { defineFireuxApp } from 'fireux-app/config'

export default defineFireuxApp({
  ecosystem: 'misebox',
  projectId: 'misebox',
  ecosystemId: 'misebox',
  id: 'la-tap-berne',
  context:
    'La Tap Berne presents Spanish plates and venue information in Matten bei Interlaken. Its public experience includes food, atmosphere, gallery and visit information.',
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
  modules: ['fireux-places', 'fireux-go-qr'],
  extends: [
    'fireux-misebox/kitchen-layer',
    'fireux-core/layer',
    'fireux-places/layer',
  ],
})
