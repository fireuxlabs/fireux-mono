import type { FirebaseTimestamp } from 'fireux-core/types/firebase'
import {
  AppBlankModel,
  BlankModel,
  type AppBlank,
  type Blank,
} from '../../models/blank.model'

export type BlankDemoScenario = {
  appId: string
  blank: Blank
  appSupport: AppBlank
}

const appId = 'fireux-blank'
const stamp: FirebaseTimestamp = {
  seconds: 1_720_000_000,
  nanoseconds: 0,
}
const created = {
  at: stamp,
  by: 'demo',
  app_id: appId,
}
const updated = {
  at: stamp,
  by: 'demo',
}

export const blankDemoScenarios: BlankDemoScenario[] = [
  {
    appId,
    blank: {
      ...BlankModel,
      id: 'blank-demo-target',
      name: 'Blank Demo Target',
      slug: 'blank-demo-target',
      status: 'active',
      management: { mode: 'workspace' },
      created,
      updated,
    },
    appSupport: {
      ...AppBlankModel,
      id: 'blank-demo-target',
      blank_id: 'blank-demo-target',
      operator_ids: [],
      team_ids: [],
      join_requests: [],
      created,
      updated,
    },
  },
]

const appSupportKeys = [
  'blank_id',
  'created',
  'id',
  'join_requests',
  'operator_ids',
  'team_ids',
  'updated',
]

for (const scenario of blankDemoScenarios) {
  const supportKeys = Object.keys(scenario.appSupport).sort()
  if (
    !scenario.appId ||
    scenario.blank.management.mode !== 'workspace' ||
    scenario.blank.created.app_id !== scenario.appId ||
    scenario.appSupport.id !== scenario.blank.id ||
    scenario.appSupport.blank_id !== scenario.blank.id ||
    scenario.appSupport.created.app_id !== scenario.appId ||
    supportKeys.length !== appSupportKeys.length ||
    supportKeys.some((key, index) => key !== appSupportKeys[index]) ||
    !Array.isArray(scenario.appSupport.operator_ids) ||
    !Array.isArray(scenario.appSupport.team_ids) ||
    !Array.isArray(scenario.appSupport.join_requests) ||
    'operator_ids' in scenario.blank ||
    'team_ids' in scenario.blank ||
    'join_requests' in scenario.blank
  ) {
    throw new Error(
      `Blank Demo ${scenario.blank.id} requires one same-App root and access-only AppBlank pair.`
    )
  }
}
