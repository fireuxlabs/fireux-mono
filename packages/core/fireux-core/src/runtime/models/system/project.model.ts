import type { FirebaseTimestamp } from '../../../types/firebase'
import type {
  FireuxAppOverlay,
  FireuxStamped,
} from '../core/meta.model'
import { FireuxAppOverlayModel } from '../core/meta.model'

export type ProjectStatus = 'draft' | 'active' | 'paused' | 'archived'
export type ProjectType = 'standalone_app' | 'ecosystem_app'

/**
 * Runtime models canon: packages/core/fireux-docs/src/runtime/models/README.md
 *
 * Family: System
 * Storage: root canonical record plus app-scoped record
 * Root path: /projects/<projectId>
 * App path: /apps/<appId>/projects/<projectId>
 *
 * Decision note:
 * - Project follows the shared root-plus-app canon used by Kitchen, Portfolio, and Supplier.
 * - Public project creation should create the root project record.
 * - App-scoped project creation should ensure the app-scoped project record and may create root first when missing.
 * - `owner_user_id` is a canonical root ownership hint, not a replacement for any app-level authority system.
 * - Public facade depth can vary by family; Project may stay relatively thin publicly while still using the same root-plus-app pattern.
 * - If Project later grows operational child records, they should live under /apps/<appId>/projects/<projectId>/...
 * - Project still remains a system-level special case because endpoint enrichment and system metadata are central to its runtime.
 * - If this decision changes, update the models README first, then this file.
 */
export const ProjectModel = {
  id: '',

  // Public-facing identity
  name: '',
  slug: '',
  description: '',
  image_url: '',
  status: 'active' as ProjectStatus,

  // System/runtime identity
  source_url: '',
  primary_project: false,
  project_type: 'standalone_app' as ProjectType,
  console_endpoint_url: '',
  app_id: '',
  ecosystem_id: '',
  firebase_project_id: '',

  // Canonical root ownership hint
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
  [K in keyof typeof ProjectModel]: (typeof ProjectModel)[K]
}

export const AppProjectModel = {
  ...FireuxAppOverlayModel,
} as const

export type AppProject = FireuxAppOverlay

export type ProjectCreateInput = Omit<Project, 'created' | 'updated' | 'owner_user_id'> & {
  owner_user_id?: string
}

export type ProjectUpdateInput = Partial<Omit<Project, 'id' | 'created' | 'updated'>>
