import { computed, unref, type Ref } from 'vue'

/**
 * FireUX stack family: Portfolio-scoped workspace operation record.
 * Entity: ComplianceRecord.
 *
 * Compliance status is derived for selected Portfolio operations; it is not a
 * root Compliance entity status seam.
 */
export type ComplianceDerivedStatus = 'ok' | 'dueSoon' | 'overdue'

export type ComplianceStatusInput = {
  expiry_date?: string | null
}

export type ComplianceStatusOptions = {
  dueSoonDays?: number
  now?: Date
}

const MS_PER_DAY = 24 * 60 * 60 * 1000

const normalizeDate = (value: unknown): Date | null => {
  const raw = String(value || '').trim()
  if (!raw) return null
  const parsed = new Date(raw)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed
}

const startOfDay = (value: Date): Date =>
  new Date(value.getFullYear(), value.getMonth(), value.getDate())

export const daysUntil = (target: Date, from: Date): number =>
  Math.floor((startOfDay(target).getTime() - startOfDay(from).getTime()) / MS_PER_DAY)

export function deriveComplianceStatus(
  expiryDate: string | null | undefined,
  options: ComplianceStatusOptions = {}
): ComplianceDerivedStatus | null {
  const expiry = normalizeDate(expiryDate)
  if (!expiry) return null

  const today = startOfDay(options.now ?? new Date())
  const diff = daysUntil(expiry, today)
  if (diff < 0) return 'overdue'

  const dueSoonDays = Math.max(0, Number(options.dueSoonDays ?? 30))
  if (diff <= dueSoonDays) return 'dueSoon'

  return 'ok'
}

export function useComplianceStatus(
  record: ComplianceStatusInput | Ref<ComplianceStatusInput | null | undefined>,
  options: ComplianceStatusOptions = {}
) {
  const status = computed(() => {
    const source = unref(record)
    if (!source) return null
    return deriveComplianceStatus(source.expiry_date ?? null, options)
  })

  return {
    status,
  }
}
