import type { Project } from '../models/project.model.ts'

export const fireuxDemoProject: Project = {
  id: 'fireux-demo-project',
  name: 'FireUX Demo Project',
  description: 'A deterministic read-only control-plane project.',
  status: 'active',
  image_url: '',
  created: { at: { seconds: 0, nanoseconds: 0 }, by: 'demo' },
  updated: { at: { seconds: 0, nanoseconds: 0 }, by: 'demo' },
}

export const projectDemoTargets: readonly Project[] = [fireuxDemoProject]
