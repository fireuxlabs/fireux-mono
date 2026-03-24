import type { ReadOnlyProjectScenario } from '../_shared/types'

export const fireuxControlRoomScenario = (): ReadOnlyProjectScenario => ({
  id: 'fireux-control-room',
  name: 'FireUX Control Room',
  label: 'Core platform operations',
  image_url:
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=320&h=320&q=80',
  project: {
    id: 'fireux-control-room',
    name: 'FireUX Control Room',
    slug: 'fireux-control-room',
    description: 'Read-only project scenario for core platform operations.',
    status: 'active',
  },
  projects: [
    { id: 'fireux-control-room', name: 'FireUX Control Room', status: 'active' },
  ],
  ecosystems: [
    { id: 'misebox', name: 'Misebox', team: 'hospitality', appCount: 3 },
    { id: 'granite', name: 'Granite', team: 'property', appCount: 1 },
  ],
  apps: [
    { id: 'fireux-app', name: 'FireUX', shortName: 'FireUX', ecosystemId: 'fireux', status: 'active' },
    { id: 'misebox-app', name: 'Misebox', shortName: 'Misebox', ecosystemId: 'misebox', status: 'active' },
    { id: 'granite-app', name: 'Granite', shortName: 'Granite', ecosystemId: 'granite', status: 'active' },
  ],
})
