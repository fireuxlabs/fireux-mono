import type { FirebaseTimestamp } from 'fireux-core/types/firebase'
import { BlankModel, type Blank } from '../../models/blank.model'

export type BlankDemoScenario = {
  appId: string
  blank: Blank
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
  },
]
