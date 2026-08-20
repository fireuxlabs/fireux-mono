import { useActivePortfolio } from 'fireux-properties/runtime/portfolio/composables/workspace/operations/useActivePortfolio'
import type { TaskCreateInput } from '../../../../../../models/task.model'

const normalize = (value: unknown) => String(value || '').trim()

const todayIso = () => new Date().toISOString().slice(0, 10)

const fallbackDueDateFromExpiry = (expiryDate: unknown) => {
  const normalized = normalize(expiryDate)
  return normalized || todayIso()
}

export function useTaskProjection(runtimePortfolio = useActivePortfolio()) {
  const runtimeId = () => normalize(runtimePortfolio.id.value)

  function fromComplianceRecord(record: {
    id?: string
    type_label?: string
    type_id?: string
    property_id?: string
    expiry_date?: string
  }): TaskCreateInput {
    const typeLabel =
      normalize(record.type_label) ||
      normalize(record.type_id) ||
      'compliance item'

    return {
      title: `Review ${typeLabel}`,
      description: [
        normalize(record.property_id)
          ? `Property ${normalize(record.property_id)}`
          : '',
        normalize(record.expiry_date)
          ? `Expiry ${normalize(record.expiry_date)}`
          : '',
      ]
        .filter(Boolean)
        .join(' · '),
      status: 'open',
      source: 'compliance',
      due_date: fallbackDueDateFromExpiry(record.expiry_date),
      linked_entity_type: 'compliance-record',
      linked_entity_id: normalize(record.id),
    }
  }

  function fromDocumentLink(link: {
    id?: string
    document_id?: string
    target_type?: string
    target_id?: string
  }): TaskCreateInput {
    return {
      title: `Review linked document ${normalize(link.document_id) || 'document'}`,
      description: [
        normalize(link.target_type)
          ? `Target type ${normalize(link.target_type)}`
          : '',
        normalize(link.target_id)
          ? `Target id ${normalize(link.target_id)}`
          : '',
        runtimeId() ? `Portfolio ${runtimeId()}` : '',
      ]
        .filter(Boolean)
        .join(' · '),
      status: 'open',
      source: 'documents',
      due_date: todayIso(),
      linked_entity_type: normalize(link.target_type) || 'document-link',
      linked_entity_id: normalize(link.id) || normalize(link.document_id),
    }
  }

  return {
    fromComplianceRecord,
    fromDocumentLink,
  }
}
