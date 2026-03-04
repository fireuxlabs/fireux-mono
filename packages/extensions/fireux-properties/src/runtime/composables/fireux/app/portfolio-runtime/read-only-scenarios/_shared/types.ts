import type { Portfolio } from '../../../../../../models/portfolio.model'
import type { Property } from '../../../../../../models/property.model'
import type { Unit } from '../../../../../../models/unit.model'

export type ReadOnlyComplianceRecord = {
  id: string
  portfolio_id: string
  property_id: string
  unit_id: string
  type_id: string
  type_label: string
  provider: string
  issue_date: string
  expiry_date: string
  document_id: string
}

export type ReadOnlyDocument = {
  id: string
  portfolio_id: string
  file_name: string
  file_type: string
  size_bytes: number
  storage_path: string
  download_url: string
  uploaded_at: string
}

export type ReadOnlyDocumentLink = {
  id: string
  portfolio_id: string
  document_id: string
  target_type: string
  target_id: string
}

export type ReadOnlyTask = {
  id: string
  portfolio_id: string
  title: string
  status: 'open' | 'in_progress' | 'done'
  source: 'manual' | 'compliance' | 'documents'
  due_date: string
  linked_entity_type: string
  linked_entity_id: string
}

export type ReadOnlyPortfolioManager = {
  id: string
  display_name: string
  avatar_url: string
}

export type ReadOnlyPortfolioScenario = {
  id: string
  name: string
  label: string
  manager: ReadOnlyPortfolioManager
  portfolio: Portfolio
  properties: Property[]
  units: Unit[]
  complianceRecords: ReadOnlyComplianceRecord[]
  documents: ReadOnlyDocument[]
  documentLinks: ReadOnlyDocumentLink[]
  tasks: ReadOnlyTask[]
}

export type ReadOnlyPortfolioScenarioListItem = {
  id: string
  name: string
  label: string
  image_url: string
  manager_display_name: string
  manager_avatar_url: string
  mode: 'read-only'
  property_count: number
  unit_count: number
  task_count: number
}
