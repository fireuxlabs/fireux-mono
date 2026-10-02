import type { Project } from 'fireux-fireux/runtime/project/models/project.model'
import { readProjectDocument } from 'fireux-fireux/runtime/project/utils/readProject'
import { getFirestoreDb } from '../../utils/firebase-admin'

export async function readProjects(): Promise<Project[]> {
  const snapshot = await (await getFirestoreDb())
    .collection('projects')
    .get()
  const projects = snapshot.docs
    .map((document): Project => {
      const project = readProjectDocument(document.data(), document.id)
      if (!project) {
        throw new Error(`Invalid canonical Project: projects/${document.id}`)
      }
      return project
    })
    .filter((project) => project.status === 'active')
    .sort((left, right) =>
      (left.name || left.id).localeCompare(right.name || right.id)
    )

  return projects
}
