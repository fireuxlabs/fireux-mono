import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'

export default defineFireuxConfig({
  ecosystem: 'misebox',
  projectId: 'misebox',
  ecosystemId: 'misebox',
  id: 'bangin-coffee',
  name: 'Bangin Coffee',
  shortName: 'Bangin Coffee',
  role: 'tenant',
  modules: ['fireux-go-qr'],
})
