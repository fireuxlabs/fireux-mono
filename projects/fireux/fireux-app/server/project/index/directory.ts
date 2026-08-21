import type { ProjectDirectoryEntry, ProjectDirectoryPage, } from 'fireux-core/runtime/project/models/project-directory.model'
import type { ProjectStatus } from 'fireux-core/runtime/project/models/project.model'
import { getFirestoreDb } from '../../utils/firebase-admin'

const text = (value: unknown) => String(value ?? '').trim()

export async function readProjectDirectoryPage(): Promise<ProjectDirectoryPage> {
  const snapshot = await (await getFirestoreDb())
    .collection('projects')
    .get()
  const projects = snapshot.docs
    .flatMap((document): ProjectDirectoryEntry[] => {
      const data = document.data() || {}
      const status = text(data.status) as ProjectStatus
      if (status !== 'active') return []
      return [
        {
          id: document.id,
          name: text(data.name),
          description: text(data.description),
          image_url: text(data.image_url),
          status,
        },
      ]
    })
    .sort((left, right) =>
      (left.name || left.id).localeCompare(right.name || right.id)
    )

  return { projects }
}
