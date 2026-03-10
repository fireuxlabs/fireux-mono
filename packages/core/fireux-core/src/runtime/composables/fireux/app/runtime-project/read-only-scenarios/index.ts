import { createReadOnlyScenarioRegistry } from '../../../runtime/createReadOnlyScenarioRegistry'
import type { FireuxProjectModel } from '../../../../../models/system/project.model'

type ProjectRow = {
  id: string
  name: string
  status: string
}

type EcosystemRow = {
  id: string
  name: string
  team: string
  appCount: number
}

type AppRow = {
  id: string
  name: string
  shortName: string
  ecosystemId: string
  status: string
}

export type ReadOnlyProjectScenario = {
  id: string
  name: string
  label: string
  image_url: string
  project: Partial<FireuxProjectModel> & { id: string }
  projects: ProjectRow[]
  ecosystems: EcosystemRow[]
  apps: AppRow[]
}

export type ReadOnlyProjectScenarioListItem = {
  id: string
  name: string
  label: string
  image_url: string
  mode: 'read-only'
}

type ScenarioKey =
  | 'fireux-control-room'
  | 'fireux-labs'
  | 'fireux-observatory'

const scenarioKeys = [
  'fireux-control-room',
  'fireux-labs',
  'fireux-observatory',
] as const satisfies readonly ScenarioKey[]

const registry = createReadOnlyScenarioRegistry<
  ReadOnlyProjectScenario,
  ScenarioKey,
  ReadOnlyProjectScenarioListItem
>({
  keys: scenarioKeys,
  defaultKey: 'fireux-control-room',
  builders: {
    'fireux-control-room': () => ({
      id: 'fireux-control-room',
      name: 'FireUX Control Room',
      label: 'Core platform operations',
      image_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=320&h=320&q=80',
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
    }),
    'fireux-labs': () => ({
      id: 'fireux-labs',
      name: 'FireUX Labs',
      label: 'Experimental project stack',
      image_url: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=320&h=320&q=80',
      project: {
        id: 'fireux-labs',
        name: 'FireUX Labs',
        slug: 'fireux-labs',
        description: 'Read-only scenario for experimental project stacks.',
        status: 'active',
      },
      projects: [
        { id: 'fireux-labs', name: 'FireUX Labs', status: 'active' },
      ],
      ecosystems: [
        { id: 'prototype', name: 'Prototype', team: 'labs', appCount: 2 },
      ],
      apps: [
        { id: 'labs-console', name: 'Labs Console', shortName: 'Labs', ecosystemId: 'prototype', status: 'active' },
        { id: 'prototype-app', name: 'Prototype App', shortName: 'Prototype', ecosystemId: 'prototype', status: 'draft' },
      ],
    }),
    'fireux-observatory': () => ({
      id: 'fireux-observatory',
      name: 'FireUX Observatory',
      label: 'Insights and telemetry',
      image_url: 'https://images.unsplash.com/photo-1517976487492-5750f3195933?auto=format&fit=crop&w=320&h=320&q=80',
      project: {
        id: 'fireux-observatory',
        name: 'FireUX Observatory',
        slug: 'fireux-observatory',
        description: 'Read-only scenario for analytics and observability.',
        status: 'active',
      },
      projects: [
        { id: 'fireux-observatory', name: 'FireUX Observatory', status: 'active' },
      ],
      ecosystems: [
        { id: 'insights', name: 'Insights', team: 'observability', appCount: 1 },
      ],
      apps: [
        { id: 'observatory-app', name: 'Observatory', shortName: 'Observatory', ecosystemId: 'insights', status: 'active' },
      ],
    }),
  },
  toListItem: (scenario) => ({
    id: scenario.id,
    name: scenario.name,
    label: scenario.label,
    image_url: scenario.image_url,
    mode: 'read-only',
  }),
})

export const getReadOnlyProjectScenario = (projectId?: string) => registry.get(projectId)
export const getReadOnlyProjectScenarioList = () => registry.getList()
