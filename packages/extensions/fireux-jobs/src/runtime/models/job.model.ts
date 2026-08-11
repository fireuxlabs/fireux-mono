// FILE: packages/extensions/fireux-jobs/src/runtime/models/job.model.ts
// Concurrent edit — 2026-07-21 12:25 CEST — Neutral Jobs migration seam: add categories and managed job type.
// Concurrent edit — 2026-07-21 12:53 CEST — Public Jobs projection: declare the completed bounded public-read contract.
// Concurrent edit — 2026-07-21 15:26 CEST — Misebox Nitro startup fix: resolve server-loaded core model and Firebase type imports explicitly.
// Concurrent edit — 2026-07-22 12:37 CEST — Shared Job spine alignment: make Agent authority, Place identity, scheduling, and compensation explicit.

import { defineFireuxEntity } from 'fireux-core/runtime/models/utils/entity.model'
import type { FireuxRootVisibility } from 'fireux-core/runtime/models/utils/scope.model'
import type { FireuxStamped } from 'fireux-core/runtime/models/utils/stamps.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'
import type { FinancialMoney } from 'fireux-finance/runtime/models/money.model'

/**
 * Current entity map: docs/concepts/entities.md
 *
 * Family: Domain Root
 * Storage: one private canonical root in the owning App database
 * Root path: /jobs/<jobId>
 * Public read: bounded server projection only
 * Authority: the Agent/User named by `owner_id`; audit stamps never grant access
 */
export const JobStorage = {
  shape: 'root',
  path: 'jobs/{jobId}',
  collection: 'jobs',
  idParam: 'jobId',
} as const

export const JobEntity = defineFireuxEntity({
  kind: 'entity',
  name: 'Job',
  family: ['content'],
  identity: 'root',
  authority: 'owning-app-database',
  appSupport: 'none',
  publicRead: 'projection',
  console: false,
  root: JobStorage.path,
  notes: [
    'The owning Agent/User is explicit in root owner scope; created.by remains audit-only.',
    'Company and canonical Place relationships are stored by id without product-specific workplace identity.',
    'Public index and exact detail reads use a bounded server projection; browsers never receive raw Job roots.',
  ],
})

export const JOB_STATUSES = ['open', 'closed'] as const
export type JobStatus = (typeof JOB_STATUSES)[number]

/** Contract duration. Platform management is a separate axis. */
export const JOB_CONTRACT_TYPES = [
  'temporary',
  'fixed_term',
  'permanent',
] as const
export type JobContractType = (typeof JOB_CONTRACT_TYPES)[number]

/** Whether the employer or the platform manages the placement. */
export const JOB_MANAGEMENT_MODES = ['direct', 'managed'] as const
export type JobManagementMode = (typeof JOB_MANAGEMENT_MODES)[number]

export const JOB_PAY_UNITS = ['hour', 'shift', 'day'] as const
export type JobPayUnit = (typeof JOB_PAY_UNITS)[number]

export type JobCompensation = FinancialMoney & {
  unit: JobPayUnit
}

export type JobVisibility = Extract<FireuxRootVisibility, 'app' | 'public'>

export type Job = {
  id: string
  source_app_id: string
  source_ecosystem_id: string
  owner_type: 'user'
  owner_id: string
  visibility: JobVisibility

  /** Employer represented in this posting. */
  company_id: string

  /** Canonical work location. Place owns all shared location truth. */
  place_id: string

  /** Product-neutral category configured by the consuming App. */
  category_id: string

  contract_type: JobContractType
  management_mode: JobManagementMode
  openings_count: number

  /** Null means compensation is not publicly disclosed. */
  compensation: JobCompensation | null

  /** Optional scheduling window; fixed-term Jobs require both values. */
  start_at: FirebaseTimestamp | null
  end_at: FirebaseTimestamp | null

  title: string
  description: string
  status: JobStatus

  created: FireuxStamped['created'] & {
    at: FirebaseTimestamp
    by: string
    app_id: string
  }
  updated: FireuxStamped['updated'] & {
    at: FirebaseTimestamp
    by: string
  }
}

// Runtime defaults describe a newly created private Job. Trusted writers still
// derive identity, scope, authority, visibility, lifecycle, and stamps.
export const JobModel = {
  id: '',
  source_app_id: '',
  source_ecosystem_id: '',
  owner_type: 'user',
  owner_id: '',
  visibility: 'app',
  company_id: '',
  place_id: '',
  category_id: '',
  contract_type: 'permanent',
  management_mode: 'direct',
  openings_count: 1,
  compensation: null,
  start_at: null,
  end_at: null,
  title: '',
  description: '',
  status: 'open',
  created: {
    at: {} as FirebaseTimestamp,
    by: '',
    app_id: '',
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: '',
  },
} as const satisfies Job

export const Job = JobModel

export type JobCreateInput = Pick<
  Job,
  | 'company_id'
  | 'place_id'
  | 'category_id'
  | 'contract_type'
  | 'management_mode'
  | 'openings_count'
  | 'compensation'
  | 'start_at'
  | 'end_at'
  | 'title'
  | 'description'
>

export type JobUpdateInput = Partial<JobCreateInput & Pick<Job, 'status'>>
