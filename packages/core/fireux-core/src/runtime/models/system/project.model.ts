import type { FirebaseTimestamp } from '../../../types/firebase'

export type FireuxProjectStatus = 'draft' | 'active' | 'paused' | 'archived'
export type FireuxProjectType = 'standalone-app' | 'ecosystem-app'

/**
 * Canon FireUX project model.
 *
 * Purpose:
 * FireUX registry entry for a Firebase project.
 *
 * Path:
 * projects/<projectId>
 *
 * Scope:
 * - Stored registry identity
 * - FireUX-owned project metadata
 *
 * Excludes:
 * - runtime inspection state
 * - SEO inspection state
 * - computed console health/status
 */
export interface FireuxProjectModel {
  /**
   * Human-readable project name
   */
  name: string

  /**
   * Stable FireUX registry slug
   */
  slug: string

  /**
   * Registry description
   */
  description: string

  /**
   * Visual identity for FireUX project surfaces
   */
  image_url: string

  /**
   * FireUX lifecycle status
   */
  status: FireuxProjectStatus

  /**
   * FireUX console primary project marker
   */
  primary_project: boolean

  /**
   * Project shape classification
   */
  project_type: FireuxProjectType

  /**
   * Public source origin for the main app
   * Example: https://fireux.app
   */
  source_url: string

  /**
   * FireUX handshake endpoint
   * Example: https://fireux.app/api/fireux-console
   */
  console_endpoint_url: string

  /**
   * Main runtime app identifier
   * Example: fireux-app
   */
  app_id: string

  /**
   * Main ecosystem identifier
   * Example: fireux
   */
  ecosystem_id: string

  /**
   * Firebase project id
   * Example: fireux-2005
   */
  firebase_project_id: string

  /**
   * FireUX user who registered the project
   */
  owner_user_id: string

  /**
   * Created timestamp
   */
  created_at: FirebaseTimestamp

  /**
   * Updated timestamp
   */
  updated_at: FirebaseTimestamp
}

export const FireuxProjectModel: FireuxProjectModel = {
  name: '',
  slug: '',
  description: '',
  image_url: '',
  status: 'active',
  primary_project: false,
  project_type: 'standalone-app',
  source_url: '',
  console_endpoint_url: '',
  app_id: '',
  ecosystem_id: '',
  firebase_project_id: '',
  owner_user_id: '',
  created_at: {} as FirebaseTimestamp,
  updated_at: {} as FirebaseTimestamp,
}

export type FireuxProjectDoc = FireuxProjectModel
export type FireuxProjectResolved = FireuxProjectModel & { id: string }