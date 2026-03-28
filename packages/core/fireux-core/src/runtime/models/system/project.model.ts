import type { FirebaseTimestamp } from '../../../types/firebase'
import { FireuxConsoleOverlay, type FireuxStamped } from '../core/meta.model'

export type ProjectStatus = 'draft' | 'active' | 'paused' | 'archived'
export type ProjectType = 'standalone_app' | 'ecosystem_app'

/**
 * Runtime models canon: packages/core/fireux-docs/src/runtime/models/README.md
 *
 * Family: Console
 * Storage: root canonical record plus app overlay
 * Root path: /projects/<projectId>
 * Overlay path: /apps/<appId>/projects/<projectId>
 * Console face: project console hosted inside an app over the root project entity plus overlay
 *
 * Decision note:
 * - Project now follows the shared console-backed canon used by Kitchen, Portfolio, and Supplier.
 * - Public project creation should create the root project record.
 * - Console project creation should ensure the app-scoped project overlay and may create root first when missing.
 * - Console authority stays user-based in the overlay; `owner_user_id` is a canonical root ownership hint, not a replacement for overlay admin authority.
 * - If Project later grows operational child records, they should live under /apps/<appId>/projects/<projectId>/...
 * - Project still remains a system-console special case because endpoint enrichment and system metadata are central to its runtime.
 * - If this decision changes, update the models README first, then this file.
 */
export const ProjectCore = {
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

export type ProjectCore = {
  [K in keyof typeof ProjectCore]: (typeof ProjectCore)[K]
}

export const ProjectApp = {
  ...FireuxConsoleOverlay,
} as const

export type ProjectApp = {
  [K in keyof typeof ProjectApp]: (typeof ProjectApp)[K]
}

export type Project = ProjectCore
export const Project = ProjectCore

export type ProjectCreateInput = Omit<ProjectCore, 'created' | 'updated' | 'owner_user_id'> & {
  owner_user_id?: string
}

export type ProjectUpdateInput = Partial<
  Pick<
    ProjectCore,
    | 'name'
    | 'slug'
    | 'description'
    | 'image_url'
    | 'status'
    | 'primary_project'
    | 'project_type'
    | 'source_url'
    | 'console_endpoint_url'
    | 'app_id'
    | 'ecosystem_id'
    | 'firebase_project_id'
    | 'owner_user_id'
  >
>

export type ProjectDoc = Omit<ProjectCore, 'id'>
export type ProjectResolved = ProjectCore
