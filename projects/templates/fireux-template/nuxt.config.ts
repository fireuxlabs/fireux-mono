import { defineFireuxApp } from 'fireux-app/config'

export default defineFireuxApp({
  ecosystem: 'fireux',
  projectId: 'fireux',
  ecosystemId: 'fireux',
  id: 'fireux-template',
  context:
    'This is the reusable starting point for a new FireUX App. Its placeholder identity and content must be replaced with the new App’s actual purpose and ownership.',
  name: 'FireUX Template',
  shortName: 'Template',
  role: 'tenant',
})
