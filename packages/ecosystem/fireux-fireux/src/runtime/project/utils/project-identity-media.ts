import type { Project } from '../models/project.model'
import type { ProjectPublishedIdentity } from '../models/published-identity'

/** Connected imagery stays App-owned; local Project imagery remains a profile photo. */
export function projectIdentityMedia(
  project?: Pick<Project, 'id' | 'identity'> | null,
  publication?: ProjectPublishedIdentity | null
): { imageUrl: string; imageFit: 'cover' | 'contain' } {
  if (publication?.projectId === project?.id && publication) {
    return {
      imageUrl: publication.status === 'ready' ? publication.imageUrl : '',
      imageFit: publication.imageFit || 'cover',
    }
  }
  return { imageUrl: project?.identity.image_url || '', imageFit: 'cover' }
}
