import { defineFireuxApp } from 'fireux-app/config'

export default defineFireuxApp({
  ecosystem: 'misebox',
  projectId: 'misebox',
  ecosystemId: 'misebox',
  id: 'friiites',
  context:
    'Friiites presents a Swiss-developed fries concept centred on hand-cut, brined potatoes triple-fried in beef tallow. Brand storytelling and confirmed menu availability remain separate.',
  name: 'Friiites',
  shortName: 'Friiites',
  role: 'tenant',
  seo: {
    siteUrl: 'https://friiites.web.app',
  },
  workspaces: ['kitchen'],
  workspaceConfig: {
    kitchen: {
      canCreate: false,
      allowDemo: false,
    },
  },
  modules: ['fireux-places', 'fireux-go-qr', 'fireux-sproochli'],
  extends: [
    'fireux-misebox/kitchen-layer',
    'fireux-core/layer',
    'fireux-places/layer',
  ],
})
