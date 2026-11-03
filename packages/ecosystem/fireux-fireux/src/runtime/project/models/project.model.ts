import type { FireuxEntity } from 'fireux-core/runtime/models/utils/entity.model'

export type ProjectStatus = 'active' | 'inactive' | 'archived'
export type ProjectIdentity = {
  status: ProjectStatus
  name: string
  description: string
  image_url: string
}

export type Project = FireuxEntity & {
  identity: ProjectIdentity
  /** Exact anonymous create/resume authority; separate from membership access. */
  guest_owner_uid?: string
}

/** Public profile only; never anonymous authority or audit provenance. */
export type ProjectPublicSummary = Pick<Project, 'id' | 'identity'>
