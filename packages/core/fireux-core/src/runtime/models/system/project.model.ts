import type { FirebaseTimestamp } from '../../../types/firebase'
import type { FireuxStamped } from '../core/meta.model'

export type ProjectStatus = 'draft' | 'active' | 'paused' | 'archived'
export type ProjectType = 'standalone_app' | 'ecosystem_app'

/**
 * Runtime models canon: packages/core/fireux-docs/src/runtime/models/README.md
 *
 * Family: Console
 * Storage: root canonical model
 * Root path: /projects/<projectId>
 * Console face: project-console facade over the same root entity
 *
 * Decision note:
 * - Project is operated through a project console, but that does not yet require a second stored overlay.
 * - Treat the console-managed view as a facade unless real scoped stored truth appears later.
 * - If this decision changes, update the models README first, then this file.
 */
export const Project = {
  id: '',

  name: '',
  slug: '',
  description: '',
  image_url: '',

  status: 'active' as ProjectStatus,
  primary_project: false,
  project_type: 'standalone_app' as ProjectType,

  source_url: '',
  console_endpoint_url: '',
  app_id: '',
  ecosystem_id: '',
  firebase_project_id: '',
  owner_user_id: '',

  created: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['created']['by'],
    app_id: undefined as FireuxStamped['created']['app_id'],
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['updated']['by'],
  },
} as const

export type Project = {
  [K in keyof typeof Project]: (typeof Project)[K]
}

export type ProjectDoc = Omit<Project, 'id'>
export type ProjectResolved = Project
