import {
  deriveComplianceStatus,
  type ComplianceDerivedStatus,
} from '../status/useComplianceStatus'
import type { ComplianceRecord } from '../../../../../../models/compliance-record.model'

const safeString = (value: unknown) => String(value ?? '').trim()

export namespace ComplianceCard {
  export type Card = {
    id: string
    title: string
    subtitle: string
    status: ComplianceDerivedStatus | null
    expiryDate: string
    to: string
  }
}

export function useComplianceInterface() {
  function card(target?: ComplianceRecord | null | undefined): ComplianceCard.Card | null {
    if (!target) return null

    const id = safeString(target.id)
    if (!id) return null

    const title = safeString(target.type_label) || safeString(target.type_id) || id
    const subtitle =
      [safeString(target.provider), safeString(target.property_id), safeString(target.unit_id)]
        .filter(Boolean)
        .join(' · ') || 'No provider or scope labels'

    const expiryDate = safeString(target.expiry_date)
    const status = deriveComplianceStatus(expiryDate, {})

    return {
      id,
      title,
      subtitle,
      status,
      expiryDate,
      to: '/console/portfolio/compliance',
    }
  }

  function searchText(target: ComplianceRecord): string {
    return [
      target.id,
      target.type_label,
      target.type_id,
      target.provider,
      target.property_id,
      target.expiry_date,
    ]
      .map((value) => safeString(value))
      .join(' ')
      .trim()
      .toLowerCase()
  }

  return {
    card,
    searchText,
  }
}
