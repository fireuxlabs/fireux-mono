import type { ProjectPublicSummary } from '../../models/project.model'
import { readProjectPublicSummary } from '../../utils/readProject'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'

export async function readProjects(): Promise<ProjectPublicSummary[]> {
  const snapshot = await getRuntimeFirestore('fireux')
    .collection('projects')
    .get()
  const projects = snapshot.docs
    .map((document): ProjectPublicSummary => {
      const project = readProjectPublicSummary(document.data(), document.id)
      if (!project) {
        throw new Error(`Invalid canonical Project: projects/${document.id}`)
      }
      return project
    })
    .filter((project) => project.identity.status === 'active')
    .sort((left, right) =>
      (left.identity.name || left.id).localeCompare(right.identity.name || right.id)
    )

  return projects
}
