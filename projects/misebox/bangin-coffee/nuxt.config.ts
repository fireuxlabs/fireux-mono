import { defineFireuxConfig, type FireuxAppConfig } from 'fireux-core/config/app/fireux.config'

const app: FireuxAppConfig = {
  ecosystem: 'misebox',
  projectId: 'misebox',
  ecosystemId: 'misebox',
  id: 'bangin-coffee',
  name: 'Bangin Coffee',
  shortName: 'Bangin Coffee',
  role: 'tenant',
  modules: ['fireux-go-qr'],
}

export default {
  ...defineFireuxConfig(app),
  extends: [
    ...(app.workspaces?.includes('kitchen')
      ? ['fireux-kitchens/layer', 'fireux-misebox/layer']
      : []),
    'fireux-core/layer',
    'fireux-blogs/layer',
  ],
}
