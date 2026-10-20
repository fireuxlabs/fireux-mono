import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'

export default defineFireuxConfig({
  ecosystem: 'fireux',
  extends: ['fireux-core/layer', 'fireux-blogs/layer'],
  projectId: 'fireux',
  ecosystemId: 'fireux',
  id: 'fireux-tenant',
  context: "This App represents Michel AG Metallbau in Goldswil, covering metal and steel construction, gates, consultation, planning and installation.",
  name: 'Michel AG Metallbau',
  shortName: 'Michel AG',
  role: 'tenant',
  contactEmail: 'info@michelmetallbau.ch',
})
