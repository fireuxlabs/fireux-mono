import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'

export default defineFireuxConfig({
  ecosystem: 'werkbox',
  // The logical Project is Werkbox; Firebase and database bindings retain their physical ids.
  projectId: 'werkbox',
  ecosystemId: 'cleanbox',
  id: 'richies-reinigung',
  name: 'Richies',
  shortName: 'Richies',
  role: 'tenant',
  extends: [
    'fireux-werkbox/layer',
    'fireux-blogs/layer',
  ],
})
