import { defineFireuxConfig, type FireuxAppConfig } from 'fireux-core/config/app/fireux.config'

const app: FireuxAppConfig = {
  ecosystem: 'misebox',
  projectId: 'misebox',
  ecosystemId: 'misebox',
  id: 'friiites',
  name: 'Friiites',
  shortName: 'Friiites',
  theme: {
    palette: {
      canvas: '#181817',
      surface: '#242321',
      canvas_inverted: '#f3e9d2',
      text: '#f3e9d2',
      text_muted: '#bdb6a5',
      ink: '#181817',
      accent: '#d99a22',
      accent_contrast: '#181817',
    },
  },
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
  modules: [
    'fireux-places',
    'fireux-go-qr',
    'fireux-sproochli',
  ],
}

export default {
  ...defineFireuxConfig(app),
  extends: [
    ...(app.workspaces?.includes('kitchen')
      ? ['fireux-kitchens/layer', 'fireux-misebox/layer']
      : []),
    'fireux-core/layer',
    'fireux-blogs/layer',
    'fireux-places/layer',
  ],
}
