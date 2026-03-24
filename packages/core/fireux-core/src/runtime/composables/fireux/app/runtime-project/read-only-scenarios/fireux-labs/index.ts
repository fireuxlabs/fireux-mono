import type { ReadOnlyProjectScenario } from '../_shared/types'

export const fireuxLabsScenario = (): ReadOnlyProjectScenario => ({
  id: 'fireux-labs',
  name: 'FireUX Labs',
  label: 'Experimental project stack',
  image_url:
    'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=320&h=320&q=80',
  project: {
    id: 'fireux-labs',
    name: 'FireUX Labs',
    slug: 'fireux-labs',
    description: 'Read-only scenario for experimental project stacks.',
    status: 'active',
  },
  projects: [{ id: 'fireux-labs', name: 'FireUX Labs', status: 'active' }],
  ecosystems: [{ id: 'prototype', name: 'Prototype', team: 'labs', appCount: 2 }],
  apps: [
    { id: 'labs-console', name: 'Labs Console', shortName: 'Labs', ecosystemId: 'prototype', status: 'active' },
    { id: 'prototype-app', name: 'Prototype App', shortName: 'Prototype', ecosystemId: 'prototype', status: 'draft' },
  ],
})
