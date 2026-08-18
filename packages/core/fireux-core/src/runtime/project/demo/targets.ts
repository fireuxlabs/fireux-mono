import type { FirebaseTimestamp } from '../../../types/firebase'
import {
  ProjectDefaults,
  type Project,
} from '../models/project.model.ts'

const stamp: FirebaseTimestamp = {
  seconds: 1_720_000_000,
  nanoseconds: 0,
}

export const projectDemoCreated = {
  at: stamp,
  by: 'demo',
  app_id: 'fireux-app',
}

export const projectDemoUpdated = {
  at: stamp,
  by: 'demo',
}

export const fireuxDemoProject: Project = {
  ...ProjectDefaults,
  id: 'fireux-demo-project',
  name: 'FireUX Demo Project',
  description: 'A deterministic read-only control-plane project.',
  status: 'active',
  created: projectDemoCreated,
  updated: projectDemoUpdated,
}

export const projectDemoTargets: readonly Project[] = [fireuxDemoProject]
