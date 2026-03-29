// FILE: packages/extensions/fireux-jobs/src/runtime/models/job.model.ts

import type { FireuxStamped } from 'fireux-core/runtime/models/core/meta.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

/**
 * Runtime models canon: packages/core/fireux-docs/src/runtime/models/README.md
 *
 * Family: Domain Root
 * Storage: root-first canonical model
 * Root path: /jobs/<jobId>
 * Console use: consoles may create or manage jobs, but the job remains one root entity by default
 * Transitional fields: legacy top-level `app_id` still remains because existing filters and runtime surfaces still read it
 *
 * Decision note:
 * - Job is root canonical truth even when a kitchen or other workplace is linked to it.
 * - The current stored shape still carries transitional app coupling while runtime filters migrate away from it.
 * - If a console later needs real scoped stored job state, add it intentionally rather than by symmetry.
 * - If that changes, update the models README first, then this file.
 */

export type JobStatus = 'open' | 'closed'

/**
 * JobType (product layer)
 *
 * - einsatz: short-term deployment / cover shift (temporary, often urgent)
 * - misebox: platform-managed deployment (routing / staffing flow managed by the platform)
 * - fixed: fixed-term role with known start + end date (contract window)
 * - permanent: ongoing role with no planned end date
 */
export type JobType = 'einsatz' | 'misebox' | 'fixed' | 'permanent'

/**
 * Pay rate unit (display + filtering)
 * Keep simple; presentation can map this to labels like "per hour".
 */
export type JobPayUnit = 'hour' | 'shift' | 'day'

/**
 * Workplace type (ecosystem-configured)
 * Keep flexible: each app/ecosystem declares allowed workplace types.
 *
 * Examples:
 * - misebox: 'kitchen'
 * - cleanbox: 'house' | 'office' | 'school'
 * - logistics: 'truck' | 'warehouse' | 'ship'
 */
export type WorkplaceType = string

// 🔑 Runtime canonical Job (source of truth)
export const Job = {
  /** Firestore document ID */
  id: '' as string,
  // Legacy top-level app scope still read by existing filters.
  app_id: '' as string,

  /**
   * Employer reference (billing / ownership)
    * One company can own many workplaces.
   */
  company_id: '' as string,

  /**
   * Work site reference (value optional)
   *
   * - workplace_type: string discriminator (configured by the app)
   * - workplace_id: fixed site identity (safe to fetch + hydrate)
   * - workplace_label: fallback for mobile/variable locations (ships, food trucks)
   *
   * Rules:
   * - workplace_type is always present as a field ('' means unset/unknown)
   * - workplace_id is always present as a field ('' means "no fixed workplace")
   */
  workplace_type: '' as WorkplaceType,
  workplace_id: '' as string,
  workplace_label: '' as string,

  /** Type (product layer) */
  job_type: 'permanent' as JobType,

  /** Hiring intent (crew size / openings) */
  openings_count: 1 as number,

  /** Pay (simple + filterable) */
  pay_currency: 'CHF' as string,
  pay_rate: 0 as number,
  pay_unit: 'hour' as JobPayUnit,

  /**
   * Time window (value optional)
   * - For einsatz/fixed you can set start/end
   * - For permanent, leave as {}
   *
   * NOTE: Multi-shift selection should be a separate collection keyed by job_id
   * (not nested arrays on Job).
   */
  start_at: {} as FirebaseTimestamp,
  end_at: {} as FirebaseTimestamp,

  /** Core job content */
  title: '' as string,
  description: '' as string,

  /** Lifecycle */
  status: 'open' as JobStatus,

  /** Authored (FireuxStamped) */
  created: {
    at: {} as FirebaseTimestamp,
    by: '' as FireuxStamped['created']['by'],
    app_id: '' as FireuxStamped['created']['app_id'],
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: '' as FireuxStamped['created']['by'],
  },
} as const

export type Job = {
  [K in keyof typeof Job]: (typeof Job)[K]
}

/**
 * Create / update helpers
 */
export type JobCreateInput = Omit<
  Job,
  'created' | 'updated' | 'id'
>

export type JobUpdateInput = Partial<Omit<JobCreateInput, never>>
