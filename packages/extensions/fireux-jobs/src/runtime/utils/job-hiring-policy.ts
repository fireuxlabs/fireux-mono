import type {
  JobApplicationAction,
  JobApplicationStatus,
} from '../models/job-application.model.ts'
import type {
  JobEngagementAction,
  JobEngagementStatus,
} from '../models/job-engagement.model.ts'
import type { JobContractType } from '../models/job.model.ts'

export type HiringActor = 'candidate' | 'employer'

function firestoreTimestampParts(value: unknown): {
  seconds: number
  nanoseconds: number
} | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const source = value as Record<string, unknown>
  const seconds = source.seconds ?? source._seconds
  const nanoseconds = source.nanoseconds ?? source._nanoseconds ?? 0
  if (
    typeof seconds !== 'number' ||
    !Number.isInteger(seconds) ||
    typeof nanoseconds !== 'number' ||
    !Number.isInteger(nanoseconds) ||
    nanoseconds < 0 ||
    nanoseconds >= 1_000_000_000
  ) {
    return null
  }
  return { seconds, nanoseconds }
}

export function sameFirestoreTimestamp(left: unknown, right: unknown): boolean {
  const leftParts = firestoreTimestampParts(left)
  const rightParts = firestoreTimestampParts(right)
  return Boolean(
    leftParts &&
      rightParts &&
      leftParts.seconds === rightParts.seconds &&
      leftParts.nanoseconds === rightParts.nanoseconds
  )
}

export function nextApplicationStatus(
  current: JobApplicationStatus,
  action: JobApplicationAction,
  actor: HiringActor
): JobApplicationStatus | null {
  if (
    actor === 'employer' &&
    action === 'offer' &&
    (current === 'submitted' || current === 'offered')
  ) {
    return 'offered'
  }
  if (
    actor === 'employer' &&
    action === 'reject' &&
    (current === 'submitted' || current === 'offered')
  ) {
    return 'rejected'
  }
  if (
    actor === 'candidate' &&
    action === 'withdraw' &&
    (current === 'submitted' || current === 'offered')
  ) {
    return 'withdrawn'
  }
  if (actor === 'candidate' && action === 'accept' && current === 'offered') {
    return 'engaged'
  }
  return null
}

export function nextEngagementStatus(
  current: JobEngagementStatus,
  action: JobEngagementAction
): JobEngagementStatus | null {
  if (action === 'start' && current === 'accepted') return 'active'
  if (
    action === 'complete' &&
    (current === 'accepted' || current === 'active')
  ) {
    return 'completed'
  }
  if (action === 'cancel' && (current === 'accepted' || current === 'active')) {
    return 'cancelled'
  }
  return null
}

export function temporaryCapacityAllowsAcceptance(input: {
  contractType: JobContractType
  hasPremiumCapacity: boolean
  activeTemporaryEngagementCount: number
  premiumLimit?: number
}): boolean {
  if (input.contractType !== 'temporary') return true
  const limit = input.hasPremiumCapacity ? (input.premiumLimit ?? 100) : 1
  return (
    Number.isInteger(input.activeTemporaryEngagementCount) &&
    input.activeTemporaryEngagementCount >= 0 &&
    input.activeTemporaryEngagementCount < limit
  )
}
