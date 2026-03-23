import {
  deriveComplianceStatus,
  type ComplianceDerivedStatus,
} from '../status/useComplianceStatus'
import type { ComplianceRecord } from '../../../../../../models/compliance-record.model'

const safeString = (value: unknown) => String(value ?? '').trim()

export namespace ComplianceCard {
  export type Card = {
    id: string
    imageUrl: string
    title: string
    subtitle: string
    meta: string
    status: ComplianceDerivedStatus | null
    badges: string[]
    summary: string
    expiryDate: string
    to: string
  }
}

export function useComplianceInterface() {
  type CompliancePill = ComplianceCard.Card
  type ComplianceCell = ComplianceCard.Card
  type CompliancePreview = ComplianceCard.Card
  type ComplianceProfile = ComplianceCard.Card

  function buildInterface(target?: ComplianceRecord | null | undefined): ComplianceCard.Card | null {
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
      imageUrl: '',
      title,
      subtitle,
      meta: expiryDate ? `expires ${expiryDate}` : '',
      status,
      badges: status ? [String(status)] : [],
      summary: '',
      expiryDate,
      to: '/console/portfolio/compliance',
    }
  }

  function pill(target?: ComplianceRecord | null | undefined): CompliancePill | null {
    return buildInterface(target)
  }

  function cell(target?: ComplianceRecord | null | undefined): ComplianceCell | null {
    return buildInterface(target)
  }

  function preview(target?: ComplianceRecord | null | undefined): CompliancePreview | null {
    return buildInterface(target)
  }

  function profile(target?: ComplianceRecord | null | undefined): ComplianceProfile | null {
    return buildInterface(target)
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

  return { interface: buildInterface,
    pill,
    cell,
    preview,
    profile,
    searchText,
  }
}
