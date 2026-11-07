import { defineFireuxEcosystem } from 'fireux-ecosystem/config'

export default defineFireuxEcosystem({
  ecosystem: 'sharer',
  extends: ['fireux-core/layer', 'fireux-sharer/layer'],
  projectId: 'sharer-ecosystem',
  ecosystemId: 'sharer',
  id: 'sharer-app',
  context:
    'Sharer provides personal sharing profiles and branded public link pages. Each profile collects the links and content its owner chooses to share.',
  name: 'Sharer',
  shortName: 'Sharer',
  role: 'global',
  authEnabled: true,
})
