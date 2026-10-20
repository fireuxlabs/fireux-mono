import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'

export default defineFireuxConfig({
  ecosystem: 'fireux',
  extends: ['fireux-core/layer', 'fireux-blogs/layer', 'fireux-ai/layer', 'fireux-products/layer'],
  projectId: 'fireux',
  ecosystemId: 'fireux',
  id: 'sproochli',
  context: "Sproochli supports drafting, reviewing and publishing multilingual copy for menus, signs, QR pages and visitor information. Generated translations remain drafts until reviewed.",
  name: 'Sproochli',
  shortName: 'Sproochli',
  databaseId: 'sproochli',
  role: 'standalone',
  modules: ['fireux-sproochli', 'fireux-ai', 'fireux-products'],
})
