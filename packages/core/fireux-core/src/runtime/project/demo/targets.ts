import type { Project } from '../models/project.model.ts'

export const fireuxDemoProject: Project = {
  id: 'fireux-demo-project',
  name: 'FireUX Demo Project',
  description: 'A deterministic read-only control-plane project.',
  status: 'active',
  image_url: '',
}

export const projectDemoTargets: readonly Project[] = [fireuxDemoProject]
