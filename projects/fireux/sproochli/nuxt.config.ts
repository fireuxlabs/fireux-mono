import { defineFireuxApp } from 'fireux-app/config'

export default defineFireuxApp({
  ecosystem: 'fireux',
  extends: ['fireux-core/layer', 'fireux-ai/layer'],
  projectId: 'fireux',
  ecosystemId: 'fireux',
  id: 'sproochli',
  context:
    'Sproochli supports drafting, reviewing and publishing multilingual copy for menus, signs, QR pages and visitor information. Generated translations remain drafts until reviewed.',
  name: 'Sproochli',
  shortName: 'Sproochli',
  databaseId: 'sproochli',
  role: 'standalone',
  modules: ['fireux-sproochli', 'fireux-ai'],
})
