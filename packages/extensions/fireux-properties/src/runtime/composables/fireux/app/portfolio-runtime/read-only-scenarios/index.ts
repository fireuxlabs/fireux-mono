import type { Portfolio } from '../../../../../models/portfolio.model'
import type { Property } from '../../../../../models/property.model'
import type { Unit } from '../../../../../models/unit.model'

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

export type ReadOnlyPortfolioScenario = {
  id: string
  portfolio: Portfolio
  properties: Property[]
  units: Unit[]
  complianceRecords: ReadOnlyComplianceRecord[]
  documents: ReadOnlyDocument[]
  documentLinks: ReadOnlyDocumentLink[]
  tasks: ReadOnlyTask[]
}

export type ScenarioKey = 'granite-demo-core'

export type ReadOnlyPortfolioScenarioListItem = {
  id: string
  name: string
  label: string
  mode: 'read-only'
}

const graniteDemoCore: ReadOnlyPortfolioScenario = {
  id: 'granite-demo-core',
  portfolio: {
    id: 'granite-demo-core',
    name: 'Granite Demo Portfolio',
    owner_label: 'Scot Demo Holdings',
    status: 'active',
    strategy_label: 'Income + Preservation',
    region_label: 'Greater London',
    notes: 'Read-only scenario for Granite pitch mode.',
    created: { at: {} as any, by: 'system', app_id: 'granite-app' },
    updated: { at: {} as any, by: 'system' },
  },
  properties: [
    {
      id: 'prop-clerkenwell-1',
      portfolio_id: 'granite-demo-core',
      name: 'Clerkenwell House',
      address_line: '84 St John Street',
      city: 'London',
      postcode: 'EC1M 4JN',
      country: 'UK',
      place_id: '',
      property_type: 'residential',
      unit_count: 8,
      status: 'active',
      created: { at: {} as any, by: 'system', app_id: 'granite-app' },
      updated: { at: {} as any, by: 'system' },
    },
    {
      id: 'prop-camden-2',
      portfolio_id: 'granite-demo-core',
      name: 'Camden Yard',
      address_line: '13 Kentish Town Road',
      city: 'London',
      postcode: 'NW1 8NH',
      country: 'UK',
      place_id: '',
      property_type: 'mixed',
      unit_count: 5,
      status: 'active',
      created: { at: {} as any, by: 'system', app_id: 'granite-app' },
      updated: { at: {} as any, by: 'system' },
    },
  ],
  units: [
    {
      id: 'unit-clerk-1a',
      portfolio_id: 'granite-demo-core',
      property_id: 'prop-clerkenwell-1',
      label: 'Flat 1A',
      unit_type: 'flat',
      bedrooms: 2,
      bathrooms: 1,
      status: 'occupied',
      created: { at: {} as any, by: 'system', app_id: 'granite-app' },
      updated: { at: {} as any, by: 'system' },
    },
    {
      id: 'unit-clerk-2b',
      portfolio_id: 'granite-demo-core',
      property_id: 'prop-clerkenwell-1',
      label: 'Flat 2B',
      unit_type: 'flat',
      bedrooms: 1,
      bathrooms: 1,
      status: 'vacant',
      created: { at: {} as any, by: 'system', app_id: 'granite-app' },
      updated: { at: {} as any, by: 'system' },
    },
    {
      id: 'unit-camden-a',
      portfolio_id: 'granite-demo-core',
      property_id: 'prop-camden-2',
      label: 'Suite A',
      unit_type: 'commercial',
      bedrooms: 0,
      bathrooms: 1,
      status: 'occupied',
      created: { at: {} as any, by: 'system', app_id: 'granite-app' },
      updated: { at: {} as any, by: 'system' },
    },
  ],
  complianceRecords: [
    {
      id: 'comp-gas-1',
      portfolio_id: 'granite-demo-core',
      property_id: 'prop-clerkenwell-1',
      unit_id: '',
      type_id: 'gas-safety',
      type_label: 'Gas Safety',
      provider: 'City Gas Ltd',
      issue_date: '2025-06-01',
      expiry_date: '2026-05-31',
      document_id: 'doc-gas-2025',
    },
    {
      id: 'comp-eicr-2',
      portfolio_id: 'granite-demo-core',
      property_id: 'prop-camden-2',
      unit_id: '',
      type_id: 'eicr',
      type_label: 'EICR',
      provider: 'WattWise Inspections',
      issue_date: '2021-04-12',
      expiry_date: '2026-04-11',
      document_id: 'doc-eicr-2021',
    },
  ],
  documents: [
    {
      id: 'doc-gas-2025',
      portfolio_id: 'granite-demo-core',
      file_name: 'gas-certificate-clerkenwell.pdf',
      file_type: 'application/pdf',
      size_bytes: 248320,
      storage_path: 'demo/granite/doc-gas-2025.pdf',
      download_url: '',
      uploaded_at: '2025-06-01',
    },
    {
      id: 'doc-eicr-2021',
      portfolio_id: 'granite-demo-core',
      file_name: 'eicr-camden.pdf',
      file_type: 'application/pdf',
      size_bytes: 418011,
      storage_path: 'demo/granite/doc-eicr-2021.pdf',
      download_url: '',
      uploaded_at: '2021-04-12',
    },
  ],
  documentLinks: [
    {
      id: 'link-1',
      portfolio_id: 'granite-demo-core',
      document_id: 'doc-gas-2025',
      target_type: 'compliance-record',
      target_id: 'comp-gas-1',
    },
    {
      id: 'link-2',
      portfolio_id: 'granite-demo-core',
      document_id: 'doc-eicr-2021',
      target_type: 'compliance-record',
      target_id: 'comp-eicr-2',
    },
  ],
  tasks: [
    {
      id: 'task-1',
      portfolio_id: 'granite-demo-core',
      title: 'Confirm next gas safety booking',
      status: 'open',
      source: 'compliance',
      due_date: '2026-04-30',
      linked_entity_type: 'compliance-record',
      linked_entity_id: 'comp-gas-1',
    },
    {
      id: 'task-2',
      portfolio_id: 'granite-demo-core',
      title: 'Chase missing insurance renewal document',
      status: 'in_progress',
      source: 'documents',
      due_date: '2026-03-15',
      linked_entity_type: 'document',
      linked_entity_id: 'doc-eicr-2021',
    },
  ],
}

const scenarioMap: Record<ScenarioKey, ReadOnlyPortfolioScenario> = {
  'granite-demo-core': graniteDemoCore,
}

const scenarioKeys: ScenarioKey[] = ['granite-demo-core']

const normalize = (value: unknown) => String(value || '').trim()

export const getReadOnlyPortfolioScenario = (
  portfolioId?: string
): ReadOnlyPortfolioScenario | null => {
  const candidate = normalize(portfolioId)
  if (!candidate) return null
  if (!(candidate as ScenarioKey in scenarioMap)) return null
  return scenarioMap[candidate as ScenarioKey]
}

export const getReadOnlyPortfolioScenarioList = (): ReadOnlyPortfolioScenarioListItem[] =>
  scenarioKeys.map((key) => ({
    id: key,
    name: scenarioMap[key].portfolio.name,
    label: scenarioMap[key].portfolio.region_label || 'Read-only demo',
    mode: 'read-only',
  }))
