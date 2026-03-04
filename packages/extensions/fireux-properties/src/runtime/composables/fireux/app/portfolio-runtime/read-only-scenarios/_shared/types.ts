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

export type ReadOnlyTenant = {
  id: string
  portfolio_id: string
  property_id: string
  unit_id: string
  display_name: string
  lease_id: string
  status: 'active' | 'ending' | 'arrears' | 'prospect'
  monthly_rent: number
  currency: string
}

export type ReadOnlyLease = {
  id: string
  portfolio_id: string
  property_id: string
  unit_id: string
  tenant_id: string
  start_date: string
  end_date: string
  deposit_amount: number
  currency: string
  status: 'active' | 'expiring' | 'ended'
  clauses_summary: string
}

export type ReadOnlyMaintenanceTicket = {
  id: string
  portfolio_id: string
  property_id: string
  unit_id: string
  title: string
  category: 'plumbing' | 'electrical' | 'heating' | 'security' | 'general'
  status: 'open' | 'scheduled' | 'done'
  priority: 'low' | 'medium' | 'high'
  reported_at: string
  scheduled_for: string
}

export type ReadOnlyFinancialSignals = {
  period_label: string
  currency: string
  gross_rent_monthly: number
  arrears_total: number
  opex_monthly: number
  net_cashflow_monthly: number
  occupancy_rate: number
  upcoming_invoices_total: number
}

export type ReadOnlyFinancialTransaction = {
  id: string
  portfolio_id: string
  property_id: string
  unit_id: string
  tenant_id: string
  type: 'rent_expected' | 'rent_received' | 'opex' | 'capex'
  category: string
  amount: number
  currency: string
  occurred_on: string
  note: string
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
  tenants?: ReadOnlyTenant[]
  leases?: ReadOnlyLease[]
  maintenance?: ReadOnlyMaintenanceTicket[]
  financials?: ReadOnlyFinancialSignals
  transactions?: ReadOnlyFinancialTransaction[]
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
