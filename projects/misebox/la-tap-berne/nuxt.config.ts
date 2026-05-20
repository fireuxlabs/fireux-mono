import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'

export default defineFireuxConfig({
  ecosystem: 'misebox',
  id: 'la-tap-berne',
  name: 'La Tap Berne',
  shortName: 'La Tap Berne',
  role: 'tenant',
  consoles: ['kitchen'],
  profiles: [],
  modules: ['fireux-kitchens'],
})
