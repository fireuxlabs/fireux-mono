// FILE: packages/extensions/fireux-jobs/src/runtime/models/job.model.ts

import type { FireuxStamped } from 'fireux-core/runtime/models/core/meta.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

/**
 * Job (canonical Firestore shape)
 * Firestore: jobs/{id}
 *
 * Principles:
 * - Stored shape only (no UI / no future theory)
 * - No optional nested objects
 * - Empty string = unset
 * - Small on purpose
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
  app_id: '' as FireuxStamped['app_id'],
  creator_id: '' as FireuxStamped['creator_id'],
  created_at: {} as FirebaseTimestamp,
  updated_at: {} as FirebaseTimestamp,
} as const

export type Job = {
  [K in keyof typeof Job]: (typeof Job)[K]
}

/**
 * Read-time enrichment only (never stored)
 * Ecosystems can hydrate workplace_id to a concrete entity (kitchen, ship, truck).
 */
export type JobResolved = Job & {
  workplace?: unknown | null
}

/**
 * Create / update helpers
 */
export type JobCreateInput = Omit<
  Job,
  'app_id' | 'creator_id' | 'created_at' | 'updated_at' | 'id'
>

export type JobUpdateInput = Partial<Omit<JobCreateInput, never>>