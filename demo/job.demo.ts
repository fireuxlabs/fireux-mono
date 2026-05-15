// Repo-level demo payloads for Jobs.
// Use these records for dev surfaces, examples, and explicit preflight demos.
// They are not canonical storage or runtime contracts.

import { useJobInterface } from 'fireux-jobs/runtime/composables/fireux/firestore/jobs/utils/view/useJobInterface'
import type { Job, JobResolved } from 'fireux-jobs/runtime/models/job.model'
import { Job as JobModelRuntime } from 'fireux-jobs/runtime/models/job.model'

import { demoKitchenHydratedList } from './kitchen.demo'

import { demoCompanyHydratedList } from './company.demo'

/**
 * Core demo job (canonical shape)
 */
export const demoJob: Job = {
  ...JobModelRuntime,

  id: 'job_demo_einsatz_001',
  company_id: String(demoCompanyHydratedList[0]?.id ?? ''),

  workplace_type: 'kitchen',
  workplace_id: String(demoKitchenHydratedList[0]?.id ?? ''),
  workplace_label: String(
    (demoKitchenHydratedList[0] as any)?.short_address ?? ''
  ),

  job_type: 'einsatz',
  openings_count: 2,

  pay_currency: 'CHF',
  pay_rate: 32,
  pay_unit: 'hour',

  start_at: {} as any,
  end_at: {} as any,

  title: 'Chef / Cook',
  description: 'Short deployment covering evening service. Clear standards, fast pace.',
  status: 'open',

  app_id: 'line-pass',
  creator_id: 'uid_harbor_ops',
  created_at: {} as any,
  updated_at: {} as any,
}

/**
 * UI-only hydration
 */
export const demoKitchenHydrated = demoKitchenHydratedList[0] ?? null
export const demoCompanyHydrated = demoCompanyHydratedList[0] ?? null

export const demoJobResolved: JobResolved = {
  ...demoJob,
  workplace: demoKitchenHydrated,
}

/**
 * Card mapping
 */
const { interface: jobInterface } = useJobInterface()
const baseCard = jobInterface(demoJobResolved)!

function formatMoney(currency: string, rate: number, unit: string) {
  const c = currency || 'CHF'
  const safe = Number.isFinite(rate) ? rate.toFixed(0) : '0'
  const u = unit === 'day' ? '/day' : unit === 'shift' ? '/shift' : '/hr'
  return `${c} ${safe}${u}`
}

/**
 * Card surfaces
 */
export const demoJobCardCell = {
  to: baseCard.to,
  imageUrl: baseCard.imageUrl,
  title: baseCard.title,
  subtitle: `${baseCard.subtitle} · 45.6 km`,
  status: baseCard.status,
  description: baseCard.description,
  badges: [
    formatMoney(demoJob.pay_currency, demoJob.pay_rate, demoJob.pay_unit),
    'Published 22 hours ago',
  ],
}

/**
 * Rich UI-only payload
 */
export const demoJobUI = {
  published_label: 'Published 22 hours ago',
  distance_label: '45.6 km',

  date_range_label: '27 Apr – 2 May',
  shifts_count_label: '6 shifts',

  shifts: [
    { date_label: 'Mon 27 Apr', start_time: '15:00', end_time: '22:00', openings_count: 1 },
    { date_label: 'Tue 28 Apr', start_time: '15:00', end_time: '22:00', openings_count: 1 },
  ],

  facilities: {
    accommodation: true,
    uniform_provided: true,
    parking_on_site: true,
  },
}

/**
 * Helpers
 */
const resolveKitchenByIndex = (i: number) =>
  demoKitchenHydratedList[i] ??
  demoKitchenHydratedList[0] ??
  null

const resolveCompanyByIndex = (i: number) =>
  demoCompanyHydratedList[i] ??
  demoCompanyHydratedList[0] ??
  null

const cloneJob = (overrides: Partial<Job>): Job => ({
  ...demoJob,
  ...overrides,
})

export const demoJobList: Job[] = [
  demoJob,
  cloneJob({
    id: 'job_demo_banquet_002',
    title: 'Banquet Chef',
    pay_rate: 38,
    pay_unit: 'day',
    openings_count: 1,
    workplace_id: String((resolveKitchenByIndex(1) as any)?.id ?? ''),
    workplace_label: String((resolveKitchenByIndex(1) as any)?.short_address ?? ''),
    company_id: String((resolveCompanyByIndex(1) as any)?.id ?? ''),
    description: 'High-volume banquet prep with plated service support.',
  }),
  cloneJob({
    id: 'job_demo_breakfast_003',
    title: 'Breakfast Lead',
    pay_rate: 28,
    pay_unit: 'hour',
    openings_count: 3,
    workplace_id: String((resolveKitchenByIndex(2) as any)?.id ?? ''),
    workplace_label: String((resolveKitchenByIndex(2) as any)?.short_address ?? ''),
    company_id: String((resolveCompanyByIndex(2) as any)?.id ?? ''),
    description: 'Early shift, fast turnaround, consistent breakfast execution.',
  }),
]

export const demoJobSurfaceList = demoJobList.map((job, index) => {
  const kitchen = resolveKitchenByIndex(index)
  const company = resolveCompanyByIndex(index)
  const resolved: JobResolved = { ...job, workplace: kitchen }
  const jobCard = jobInterface(resolved)!

  return {
    job,
    resolved,
    kitchen,
    company,
    card: jobCard,
  }
})

export const demoJobSurface = demoJobSurfaceList[0]
