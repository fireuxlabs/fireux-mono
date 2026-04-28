import type { Portfolio } from '../../../../models/portfolio.model'
import type { Property } from '../../../../models/property.model'
import type { Unit } from '../../../../models/unit.model'

export type DemoPortfolioListItem = {
  id: string
  name: string
  label: string
  image_url?: string
}

export type DemoPortfolio = Portfolio & {
  image_url?: string
}

export type DemoProperty = Property

export type DemoUnit = Unit

export type DemoTenant = Record<string, unknown> & {
  id?: string
  property_id?: string
  unit_id?: string
  lease_id?: string
  monthly_rent?: number
  status?: string
}

export type DemoLease = Record<string, unknown> & {
  id: string
  property_id?: string
  unit_id?: string
  tenant_id?: string
  end_date?: string
}

export type DemoDocument = Record<string, unknown> & {
  id: string
  portfolio_id?: string
  file_name?: string
  file_type?: string
  size_bytes?: number
  storage_path?: string
  download_url?: string
  uploaded_at?: string
}

export type DemoDocumentLink = Record<string, unknown> & {
  id: string
  portfolio_id?: string
  document_id?: string
  target_type?: string
  target_id?: string
}

export type DemoComplianceRecord = Record<string, unknown> & {
  id: string
  portfolio_id?: string
  property_id?: string
  unit_id?: string
  type_id?: string
  type_label?: string
  provider?: string
  issue_date?: string
  expiry_date?: string
  document_id?: string
}

export type DemoTask = Record<string, unknown> & {
  id: string
  portfolio_id?: string
  title?: string
  status: 'open' | 'in_progress' | 'done'
  source: 'manual' | 'compliance' | 'documents'
  due_date?: string
  linked_entity_type?: string
  linked_entity_id?: string
}

export type DemoPortfolioScenario = DemoPortfolioListItem & {
  portfolio?: Partial<Portfolio> & { image_url?: string }
  properties: DemoProperty[]
  units: DemoUnit[]
  tenants: DemoTenant[]
  leases: DemoLease[]
  financials?: Record<string, unknown> & { currency?: string }
  transactions?: Array<Record<string, unknown> & { currency?: string }>
  documents: DemoDocument[]
  documentLinks: DemoDocumentLink[]
  complianceRecords: DemoComplianceRecord[]
  tasks: DemoTask[]
}

const normalizeString = (value: unknown) => String(value ?? '').trim()

const stamp = () => ({
  at: {} as any,
  by: undefined,
  app_id: undefined,
})

const updateStamp = () => ({
  at: {} as any,
  by: undefined,
})

const demoPortfolioScenarios: DemoPortfolioScenario[] = [
  {
    id: 'rivergate-estate',
    name: 'Rivergate Estate',
    label: 'Mixed-use city portfolio',
    image_url:
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=320&h=320&q=80',
    portfolio: {
      name: 'Rivergate Estate',
      slug: 'rivergate-estate',
      owner_label: 'Rivergate Holdings',
      strategy_label: 'Urban income and compliance',
      region_label: 'London',
      notes: 'Demo portfolio for properties, documents, compliance, and tasks.',
    },
    properties: [
      {
        id: 'rivergate-house',
        portfolio_id: 'rivergate-estate',
        name: 'Rivergate House',
        address_line: '12 Rivergate Street',
        city: 'London',
        postcode: 'SE1 4RG',
        country: 'United Kingdom',
        place_id: 'demo-rivergate-house',
        image_url:
          'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=320&h=240&q=80',
        property_type: 'mixed',
        unit_count: 18,
        estimated_value: 8200000,
        estimated_value_currency: 'GBP',
        status: 'active',
        created: stamp(),
        updated: updateStamp(),
      },
      {
        id: 'warehouse-lane',
        portfolio_id: 'rivergate-estate',
        name: 'Warehouse Lane',
        address_line: '4 Warehouse Lane',
        city: 'London',
        postcode: 'E1 8WL',
        country: 'United Kingdom',
        place_id: 'demo-warehouse-lane',
        image_url:
          'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=320&h=240&q=80',
        property_type: 'commercial',
        unit_count: 6,
        estimated_value: 4600000,
        estimated_value_currency: 'GBP',
        status: 'active',
        created: stamp(),
        updated: updateStamp(),
      },
    ],
    units: [
      {
        id: 'rivergate-house-a1',
        portfolio_id: 'rivergate-estate',
        property_id: 'rivergate-house',
        label: 'A1',
        unit_type: 'flat',
        bedrooms: 2,
        bathrooms: 1,
        status: 'occupied',
        created: stamp(),
        updated: updateStamp(),
      },
      {
        id: 'warehouse-lane-retail',
        portfolio_id: 'rivergate-estate',
        property_id: 'warehouse-lane',
        label: 'Retail Unit',
        unit_type: 'commercial',
        bedrooms: 0,
        bathrooms: 1,
        status: 'occupied',
        created: stamp(),
        updated: updateStamp(),
      },
    ],
    tenants: [
      {
        id: 'tenant-rivergate-a1',
        property_id: 'rivergate-house',
        unit_id: 'rivergate-house-a1',
        lease_id: 'lease-rivergate-a1',
        monthly_rent: 2450,
        status: 'active',
      },
      {
        id: 'tenant-warehouse-retail',
        property_id: 'warehouse-lane',
        unit_id: 'warehouse-lane-retail',
        lease_id: 'lease-warehouse-retail',
        monthly_rent: 5200,
        status: 'ending',
      },
    ],
    leases: [
      {
        id: 'lease-rivergate-a1',
        property_id: 'rivergate-house',
        unit_id: 'rivergate-house-a1',
        tenant_id: 'tenant-rivergate-a1',
        end_date: '2027-03-31',
      },
      {
        id: 'lease-warehouse-retail',
        property_id: 'warehouse-lane',
        unit_id: 'warehouse-lane-retail',
        tenant_id: 'tenant-warehouse-retail',
        end_date: '2026-09-30',
      },
    ],
    financials: {
      currency: 'GBP',
    },
    transactions: [
      {
        id: 'txn-rivergate-rent',
        currency: 'GBP',
        amount: 7650,
      },
    ],
    documents: [
      {
        id: 'doc-rivergate-fire-risk',
        portfolio_id: 'rivergate-estate',
        file_name: 'rivergate-fire-risk.pdf',
        file_type: 'application/pdf',
        size_bytes: 248000,
        storage_path: 'demo/rivergate/fire-risk.pdf',
        download_url: '',
        uploaded_at: '2026-02-15',
      },
      {
        id: 'doc-warehouse-lease',
        portfolio_id: 'rivergate-estate',
        file_name: 'warehouse-lane-lease.pdf',
        file_type: 'application/pdf',
        size_bytes: 182000,
        storage_path: 'demo/rivergate/warehouse-lease.pdf',
        download_url: '',
        uploaded_at: '2026-01-10',
      },
    ],
    documentLinks: [
      {
        id: 'link-rivergate-fire-risk',
        portfolio_id: 'rivergate-estate',
        document_id: 'doc-rivergate-fire-risk',
        target_type: 'compliance-record',
        target_id: 'compliance-rivergate-fire-risk',
      },
      {
        id: 'link-warehouse-lease',
        portfolio_id: 'rivergate-estate',
        document_id: 'doc-warehouse-lease',
        target_type: 'property',
        target_id: 'warehouse-lane',
      },
    ],
    complianceRecords: [
      {
        id: 'compliance-rivergate-fire-risk',
        portfolio_id: 'rivergate-estate',
        property_id: 'rivergate-house',
        unit_id: '',
        type_id: 'fire-risk-assessment',
        type_label: 'Fire risk assessment',
        provider: 'SafeBlock Compliance',
        issue_date: '2026-02-15',
        expiry_date: '2027-02-15',
        document_id: 'doc-rivergate-fire-risk',
      },
      {
        id: 'compliance-warehouse-eicr',
        portfolio_id: 'rivergate-estate',
        property_id: 'warehouse-lane',
        unit_id: 'warehouse-lane-retail',
        type_id: 'eicr',
        type_label: 'Electrical certificate',
        provider: 'VoltSure',
        issue_date: '2025-04-20',
        expiry_date: '2026-05-20',
        document_id: '',
      },
    ],
    tasks: [
      {
        id: 'task-renew-warehouse-eicr',
        portfolio_id: 'rivergate-estate',
        title: 'Book Warehouse Lane EICR renewal',
        status: 'open',
        source: 'compliance',
        due_date: '2026-05-01',
        linked_entity_type: 'compliance-record',
        linked_entity_id: 'compliance-warehouse-eicr',
      },
      {
        id: 'task-review-warehouse-lease',
        portfolio_id: 'rivergate-estate',
        title: 'Review Warehouse Lane lease break',
        status: 'in_progress',
        source: 'documents',
        due_date: '2026-08-15',
        linked_entity_type: 'document',
        linked_entity_id: 'doc-warehouse-lease',
      },
    ],
  },
]

const cloneScenario = (
  scenario: DemoPortfolioScenario
): DemoPortfolioScenario => ({
  ...scenario,
  portfolio: scenario.portfolio ? { ...scenario.portfolio } : undefined,
  properties: scenario.properties.map((entry) => ({ ...entry })),
  units: scenario.units.map((entry) => ({ ...entry })),
  tenants: scenario.tenants.map((entry) => ({ ...entry })),
  leases: scenario.leases.map((entry) => ({ ...entry })),
  financials: scenario.financials ? { ...scenario.financials } : undefined,
  transactions: scenario.transactions?.map((entry) => ({ ...entry })),
  documents: scenario.documents.map((entry) => ({ ...entry })),
  documentLinks: scenario.documentLinks.map((entry) => ({ ...entry })),
  complianceRecords: scenario.complianceRecords.map((entry) => ({ ...entry })),
  tasks: scenario.tasks.map((entry) => ({ ...entry })),
})

const toPortfolio = (scenario: DemoPortfolioScenario): DemoPortfolio => {
  const id = normalizeString(scenario.id)
  const portfolio = scenario.portfolio ?? {}

  return {
    id,
    app_scope_state: 'root_only',
    app_scope_app_id: '',
    name:
      normalizeString(portfolio.name) || normalizeString(scenario.name) || id,
    slug: normalizeString(portfolio.slug) || id,
    owner_label: normalizeString(portfolio.owner_label),
    status: portfolio.status === 'archived' ? 'archived' : 'active',
    strategy_label: normalizeString(portfolio.strategy_label),
    region_label: normalizeString(portfolio.region_label || scenario.label),
    notes: normalizeString(portfolio.notes),
    image_url: normalizeString(portfolio.image_url || scenario.image_url),
    created: { at: {} as any, by: undefined, app_id: undefined },
    updated: { at: {} as any, by: undefined },
  }
}

export function getDemoPortfolioScenarios() {
  return demoPortfolioScenarios.map((scenario) => cloneScenario(scenario))
}

export function getDemoPortfolioScenario(portfolioId: unknown) {
  const id = normalizeString(portfolioId)
  if (!id) return null

  const scenario = demoPortfolioScenarios.find(
    (entry) => normalizeString(entry.id) === id
  )
  return scenario ? cloneScenario(scenario) : null
}

export function getDemoPortfolios() {
  return demoPortfolioScenarios.map((scenario) => toPortfolio(scenario))
}
