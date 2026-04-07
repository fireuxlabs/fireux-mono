import type { Portfolio } from '../../../../../../models/portfolio.model'
import type { Property } from '../../../../../../models/property.model'
import type { Unit } from '../../../../../../models/unit.model'
import type {
    DemoComplianceRecord,
    DemoDocument,
    DemoDocumentLink,
    DemoFinancialSignals,
    DemoFinancialTransaction,
    DemoLease,
    DemoMaintenanceTicket,
    DemoPortfolioScenario,
    DemoTask,
    DemoTenant,
} from './types'

type ScenarioPressure = 'stable' | 'growth' | 'stressed'

type PropertySeed = {
  key: string
  name: string
  address_line: string
  city: string
  postcode: string
  country: string
  property_type: Property['property_type']
  unit_count: number
  estimated_value: number
  image_url: string
  base_rent: number
}

type BuildDemoPortfolioScenarioInput = {
  id: string
  name: string
  label: string
  manager: {
    id: string
    display_name: string
    avatar_url: string
  }
  owner_label: string
  strategy_label: string
  region_label: string
  notes: string
  currency: string
  pressure: ScenarioPressure
  properties: PropertySeed[]
  months?: string[]
}

const FIRST_NAMES = [
  'Amelia',
  'Noah',
  'Isla',
  'Jack',
  'Maya',
  'Luca',
  'Ava',
  'Leo',
  'Sofia',
  'Ethan',
  'Aria',
  'Milo',
  'Nina',
  'Theo',
  'Freya',
  'Owen',
] as const

const LAST_NAMES = [
  'Taylor',
  'Patel',
  'Ward',
  'Bennett',
  'Morgan',
  'Hughes',
  'Clarke',
  'Green',
  'Rossi',
  'Ahmed',
  'Shaw',
  'Reed',
] as const

const COMPANY_NAMES = [
  'Northpoint Media Ltd',
  'Bricklane Design Studio',
  'Signal Advisory Group',
  'Urban Ledger Partners',
  'Aster Legal Services',
  'Foundry Product Labs',
  'Civic Health Clinic',
  'Latitude Analytics',
] as const

const COMPLIANCE_TYPES = [
  {
    id: 'gas-safety',
    label: 'Gas Safety',
    provider: 'City Gas Services',
  },
  {
    id: 'eicr',
    label: 'Electrical Inspection',
    provider: 'GridSure Inspections',
  },
  {
    id: 'fire-risk',
    label: 'Fire Risk Assessment',
    provider: 'SafeBlock Compliance',
  },
] as const

const MAINTENANCE_CATEGORIES: DemoMaintenanceTicket['category'][] = [
  'plumbing',
  'electrical',
  'heating',
  'security',
  'general',
]

const pad2 = (value: number) => String(value).padStart(2, '0')

const toIsoDate = (date: Date) =>
  `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}-${pad2(date.getUTCDate())}`

const shiftDays = (anchor: Date, days: number) => {
  const next = new Date(anchor)
  next.setUTCDate(next.getUTCDate() + days)
  return next
}

const parseYearMonth = (value: string) => {
  const [yearRaw, monthRaw] = String(value || '').split('-')
  const year = Number(yearRaw)
  const month = Number(monthRaw)
  if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) {
    return null
  }
  return { year, month }
}

const monthLabel = (value: string) => {
  const parsed = parseYearMonth(value)
  if (!parsed) return 'Current period'
  const date = new Date(Date.UTC(parsed.year, parsed.month - 1, 1))
  return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' })
}

const roundCurrency = (value: number) => Math.round(Number(value || 0))

const buildStamp = () => ({
  created: { at: {} as any, by: 'system', app_id: 'site-ledger' },
  updated: { at: {} as any, by: 'system' },
})

const pressureVacancyRate = (pressure: ScenarioPressure) => {
  if (pressure === 'stable') return 0.06
  if (pressure === 'growth') return 0.12
  return 0.2
}

const pressureArrearsRate = (pressure: ScenarioPressure) => {
  if (pressure === 'stable') return 0.07
  if (pressure === 'growth') return 0.13
  return 0.24
}

const pressureOpenIncidentRate = (pressure: ScenarioPressure) => {
  if (pressure === 'stable') return 0.25
  if (pressure === 'growth') return 0.4
  return 0.65
}

const pressureCollectionBase = (pressure: ScenarioPressure) => {
  if (pressure === 'stable') return 0.985
  if (pressure === 'growth') return 0.945
  return 0.82
}

const pressureOpexRatio = (pressure: ScenarioPressure) => {
  if (pressure === 'stable') return 0.23
  if (pressure === 'growth') return 0.27
  return 0.34
}

const referenceDate = new Date(Date.UTC(2026, 2, 1))

const daysToDate = (dateValue: string) => {
  const parsed = new Date(`${String(dateValue || '').trim()}T00:00:00Z`)
  if (Number.isNaN(parsed.getTime())) return null
  return Math.floor((parsed.getTime() - referenceDate.getTime()) / (24 * 60 * 60 * 1000))
}

const sumByType = (
  transactions: DemoFinancialTransaction[],
  monthKey: string,
  type: DemoFinancialTransaction['type']
) =>
  transactions
    .filter((entry) => entry.type === type && String(entry.occurred_on || '').startsWith(monthKey))
    .reduce((sum, entry) => sum + Number(entry.amount || 0), 0)

export const buildDemoPortfolioScenario = (
  input: BuildDemoPortfolioScenarioInput
): DemoPortfolioScenario => {
  const months = input.months ?? ['2025-10', '2025-11', '2025-12', '2026-01', '2026-02', '2026-03']

  const portfolio: Portfolio = {
    id: input.id,
    name: input.name,
    owner_label: input.owner_label,
    status: 'active',
    strategy_label: input.strategy_label,
    region_label: input.region_label,
    notes: input.notes,
    ...buildStamp(),
  }

  const properties: Property[] = input.properties.map((seed) => ({
    id: `prop-${seed.key}`,
    portfolio_id: input.id,
    name: seed.name,
    address_line: seed.address_line,
    city: seed.city,
    postcode: seed.postcode,
    country: seed.country,
    place_id: '',
    image_url: seed.image_url,
    property_type: seed.property_type,
    unit_count: seed.unit_count,
    estimated_value: seed.estimated_value,
    estimated_value_currency: input.currency,
    status: 'active',
    ...buildStamp(),
  }))

  const vacancyRate = pressureVacancyRate(input.pressure)

  const units: Unit[] = properties.flatMap((property, propertyIndex) => {
    const seed = input.properties[propertyIndex]
    return Array.from({ length: Math.max(1, Number(seed.unit_count || 0)) }).map((_, unitOffset) => {
      const unitNumber = unitOffset + 1
      const occupancyRoll = (propertyIndex * 19 + unitNumber * 11) % 100
      const isVacant = occupancyRoll < vacancyRate * 100
      const unitType: Unit['unit_type'] =
        property.property_type === 'commercial'
          ? 'commercial'
          : property.property_type === 'mixed' && unitNumber % 4 === 0
            ? 'commercial'
            : property.property_type === 'residential' && unitNumber % 6 === 0
              ? 'house'
              : 'flat'

      return {
        id: `${property.id}-u${pad2(unitNumber)}`,
        portfolio_id: input.id,
        property_id: property.id,
        label: unitType === 'commercial' ? `Suite ${unitNumber}` : `Unit ${unitNumber}`,
        unit_type: unitType,
        bedrooms: unitType === 'commercial' ? 0 : 1 + ((propertyIndex + unitNumber) % 3),
        bathrooms: unitType === 'commercial' ? 1 : 1 + ((propertyIndex + unitNumber) % 2),
        status: isVacant ? 'vacant' : 'occupied',
        ...buildStamp(),
      }
    })
  })

  const arrearsRate = pressureArrearsRate(input.pressure)

  const tenants: DemoTenant[] = units
    .filter((unit) => unit.status === 'occupied')
    .map((unit, tenantIndex) => {
      const property = properties.find((entry) => entry.id === unit.property_id)
      const propertySeed = input.properties.find((seed) => `prop-${seed.key}` === unit.property_id)
      const isCommercial = unit.unit_type === 'commercial'
      const arrearsRoll = (tenantIndex * 23 + unit.id.length * 7) % 100
      const endingRoll = (tenantIndex * 17 + unit.id.length * 3) % 100

      const status: DemoTenant['status'] =
        arrearsRoll < arrearsRate * 100
          ? 'arrears'
          : endingRoll < 14
            ? 'ending'
            : 'active'

      const displayName = isCommercial
        ? COMPANY_NAMES[tenantIndex % COMPANY_NAMES.length]
        : `${FIRST_NAMES[tenantIndex % FIRST_NAMES.length]} ${LAST_NAMES[(tenantIndex * 3) % LAST_NAMES.length]}`

      const baseRent = Number(propertySeed?.base_rent || 1400)
      const commercialMultiplier = isCommercial ? 1.55 : 1
      const monthlyRent = roundCurrency(
        (baseRent + (tenantIndex % 5) * 85 + (property ? Number(property.unit_count || 0) : 0) * 12) *
          commercialMultiplier
      )

      return {
        id: `tenant-${input.id}-${pad2(tenantIndex + 1)}`,
        portfolio_id: input.id,
        property_id: unit.property_id,
        unit_id: unit.id,
        display_name: displayName,
        lease_id: `lease-${unit.id}`,
        status,
        monthly_rent: monthlyRent,
        currency: input.currency,
      }
    })

  const leases: DemoLease[] = tenants.map((tenant, leaseIndex) => {
    const startYear = 2022 + (leaseIndex % 3)
    const startMonth = 1 + ((leaseIndex * 2) % 12)
    const endYear = 2026 + (leaseIndex % 3)
    const endMonth = 1 + ((leaseIndex * 4 + 2) % 12)
    const endDate = `${endYear}-${pad2(endMonth)}-28`
    const days = daysToDate(endDate)

    const status: DemoLease['status'] =
      days !== null && days >= 0 && days <= 120
        ? 'expiring'
        : days !== null && days < 0
          ? 'ended'
          : 'active'

    return {
      id: tenant.lease_id,
      portfolio_id: input.id,
      property_id: tenant.property_id,
      unit_id: tenant.unit_id,
      tenant_id: tenant.id,
      start_date: `${startYear}-${pad2(startMonth)}-01`,
      end_date: endDate,
      deposit_amount: roundCurrency(tenant.monthly_rent * 1.3),
      currency: input.currency,
      status,
      clauses_summary:
        leaseIndex % 2 === 0
          ? 'Break option after month 18 with 60 days notice.'
          : 'Annual indexation and service charge reconciliation.',
    }
  })

  const compliancePerProperty = input.pressure === 'stressed' ? 3 : 2

  const complianceRecords: DemoComplianceRecord[] = properties.flatMap((property, propertyIndex) =>
    COMPLIANCE_TYPES.slice(0, compliancePerProperty).map((type, typeIndex) => {
      const exposureBias =
        input.pressure === 'stable'
          ? 40
          : input.pressure === 'growth'
            ? 5
            : -65

      const offset = exposureBias + ((propertyIndex * 29 + typeIndex * 17) % 180)
      const expiryDate = toIsoDate(shiftDays(referenceDate, offset))
      const issueDate = toIsoDate(shiftDays(referenceDate, offset - 330))

      return {
        id: `comp-${property.id}-${type.id}`,
        portfolio_id: input.id,
        property_id: property.id,
        unit_id: '',
        type_id: type.id,
        type_label: type.label,
        provider: type.provider,
        issue_date: issueDate,
        expiry_date: expiryDate,
        document_id: `doc-${property.id}-${type.id}`,
      }
    })
  )

  const documents: DemoDocument[] = complianceRecords.map((record, index) => ({
    id: record.document_id,
    portfolio_id: input.id,
    file_name: `${record.type_id}-${record.property_id}.pdf`,
    file_type: 'application/pdf',
    size_bytes: 120000 + (index % 8) * 8300,
    storage_path: `demo/cedar-loop/${input.id}/${record.document_id}.pdf`,
    download_url: '',
    uploaded_at: record.issue_date,
  }))

  const documentLinks: DemoDocumentLink[] = complianceRecords.map((record) => ({
    id: `link-${record.id}`,
    portfolio_id: input.id,
    document_id: record.document_id,
    target_type: 'compliance-record',
    target_id: record.id,
  }))

  const incidentPerProperty = input.pressure === 'stressed' ? 5 : input.pressure === 'growth' ? 3 : 2
  const openIncidentRate = pressureOpenIncidentRate(input.pressure)

  const maintenance: DemoMaintenanceTicket[] = properties.flatMap((property, propertyIndex) =>
    Array.from({ length: incidentPerProperty }).map((_, ticketOffset) => {
      const key = propertyIndex * 10 + ticketOffset
      const statusRoll = (key * 19 + property.id.length * 11) % 100
      const status: DemoMaintenanceTicket['status'] =
        statusRoll < openIncidentRate * 100
          ? 'open'
          : statusRoll < openIncidentRate * 100 + 25
            ? 'scheduled'
            : 'done'

      const priority: DemoMaintenanceTicket['priority'] =
        status === 'done' ? 'low' : statusRoll % 3 === 0 ? 'high' : 'medium'

      const category = MAINTENANCE_CATEGORIES[key % MAINTENANCE_CATEGORIES.length]
      const reportedAt = toIsoDate(shiftDays(referenceDate, -(4 + key * 2)))
      const scheduledFor =
        status === 'done'
          ? toIsoDate(shiftDays(referenceDate, -(1 + key)))
          : input.pressure === 'stressed' && key % 4 === 0
            ? toIsoDate(shiftDays(referenceDate, -(2 + (key % 3))))
            : toIsoDate(shiftDays(referenceDate, 1 + (key % 12)))

      return {
        id: `maint-${property.id}-${pad2(ticketOffset + 1)}`,
        portfolio_id: input.id,
        property_id: property.id,
        unit_id: '',
        title: `${category} incident at ${property.name}`,
        category,
        status,
        priority,
        reported_at: reportedAt,
        scheduled_for: scheduledFor,
      }
    })
  )

  const complianceTasks: DemoTask[] = complianceRecords
    .flatMap((record): DemoTask[] => {
      const days = daysToDate(record.expiry_date)
      if (days === null || days > 45) return []

      const status: DemoTask['status'] = days < 0 ? 'in_progress' : 'open'
      return [{
        id: `task-comp-${record.id}`,
        portfolio_id: input.id,
        title: `${record.type_label} action for ${record.property_id}`,
        status,
        source: 'compliance',
        due_date: toIsoDate(shiftDays(referenceDate, Math.max(days, 2))),
        linked_entity_type: 'compliance-record',
        linked_entity_id: record.id,
      }]
    })

  const maintenanceTasks: DemoTask[] = maintenance
    .filter((ticket) => ticket.status !== 'done')
    .map((ticket): DemoTask => {
      const status: DemoTask['status'] = ticket.status === 'open' ? 'open' : 'in_progress'

      return {
        id: `task-maint-${ticket.id}`,
        portfolio_id: input.id,
        title: `Resolve ${ticket.category} ticket at ${ticket.property_id}`,
        status,
        source: 'manual',
        due_date: ticket.scheduled_for,
        linked_entity_type: 'maintenance-ticket',
        linked_entity_id: ticket.id,
      }
    })
    .slice(0, input.pressure === 'stressed' ? 30 : 18)

  const documentTasks: DemoTask[] = documents
    .slice(0, Math.min(8, documents.length))
    .map((doc, index) => ({
      id: `task-doc-${doc.id}`,
      portfolio_id: input.id,
      title: `Validate document metadata for ${doc.file_name}`,
      status: index % 3 === 0 ? 'done' : 'open',
      source: 'documents',
      due_date: toIsoDate(shiftDays(referenceDate, 7 + index)),
      linked_entity_type: 'document',
      linked_entity_id: doc.id,
    }))

  const tasks: DemoTask[] = [...complianceTasks, ...maintenanceTasks, ...documentTasks]

  const rentByProperty = new Map<string, number>()
  for (const tenant of tenants) {
    const key = String(tenant.property_id || '').trim()
    if (!key) continue
    rentByProperty.set(key, (rentByProperty.get(key) || 0) + Number(tenant.monthly_rent || 0))
  }

  const transactions: DemoFinancialTransaction[] = months.flatMap((month, monthIndex) => {
    const parsed = parseYearMonth(month)
    if (!parsed) return []

    return properties.flatMap((property, propertyIndex) => {
      const expectedBase = Math.max(0, roundCurrency(rentByProperty.get(property.id) || 0))
      const collectionBase = pressureCollectionBase(input.pressure)
      const drift = ((monthIndex * 7 + propertyIndex * 5) % 9) / 100
      const collectionRatio = Math.max(0.62, Math.min(1, collectionBase - drift + (monthIndex === months.length - 1 ? 0.01 : 0)))

      const expected = expectedBase
      const received = roundCurrency(expected * collectionRatio)

      const opexRatio = pressureOpexRatio(input.pressure) + (propertyIndex % 3) * 0.01
      const opex = roundCurrency(expected * opexRatio)

      const capex =
        input.pressure === 'stressed'
          ? (monthIndex + propertyIndex) % 3 === 0
            ? roundCurrency(1800 + (propertyIndex % 5) * 900)
            : 0
          : input.pressure === 'growth'
            ? (monthIndex + propertyIndex) % 6 === 0
              ? roundCurrency(1200 + (propertyIndex % 4) * 500)
              : 0
            : (monthIndex + propertyIndex) % 10 === 0
              ? roundCurrency(700 + (propertyIndex % 3) * 300)
              : 0

      const txDate = `${parsed.year}-${pad2(parsed.month)}-01`
      const baseId = `${input.id}-${month}-${property.id}`

      const rows: DemoFinancialTransaction[] = [
        {
          id: `txn-expected-${baseId}`,
          portfolio_id: input.id,
          property_id: property.id,
          unit_id: '',
          tenant_id: '',
          type: 'rent_expected',
          category: 'rent-roll',
          amount: expected,
          currency: input.currency,
          occurred_on: txDate,
          note: 'Expected rent roll for month',
        },
        {
          id: `txn-received-${baseId}`,
          portfolio_id: input.id,
          property_id: property.id,
          unit_id: '',
          tenant_id: '',
          type: 'rent_received',
          category: 'collections',
          amount: received,
          currency: input.currency,
          occurred_on: txDate,
          note: 'Collected rent for month',
        },
        {
          id: `txn-opex-${baseId}`,
          portfolio_id: input.id,
          property_id: property.id,
          unit_id: '',
          tenant_id: '',
          type: 'opex',
          category: 'operations',
          amount: opex,
          currency: input.currency,
          occurred_on: txDate,
          note: 'Monthly operating costs',
        },
      ]

      if (capex > 0) {
        rows.push({
          id: `txn-capex-${baseId}`,
          portfolio_id: input.id,
          property_id: property.id,
          unit_id: '',
          tenant_id: '',
          type: 'capex',
          category: 'asset-improvement',
          amount: capex,
          currency: input.currency,
          occurred_on: txDate,
          note: 'Capex and major repairs',
        })
      }

      return rows
    })
  })

  const latestMonth = months[months.length - 1] || '2026-03'
  const grossRentMonthly = sumByType(transactions, latestMonth, 'rent_expected')
  const rentReceivedMonthly = sumByType(transactions, latestMonth, 'rent_received')
  const opexMonthly = sumByType(transactions, latestMonth, 'opex')
  const capexMonthly = sumByType(transactions, latestMonth, 'capex')

  const occupiedUnits = units.filter((unit) => unit.status === 'occupied').length
  const occupancyRate = units.length > 0 ? occupiedUnits / units.length : 0

  const dueSoonCompliance = complianceRecords.filter((record) => {
    const days = daysToDate(record.expiry_date)
    return days !== null && days >= 0 && days <= 30
  }).length

  const openMaintenance = maintenance.filter((ticket) => ticket.status !== 'done').length

  const financials: DemoFinancialSignals = {
    period_label: monthLabel(latestMonth),
    currency: input.currency,
    gross_rent_monthly: grossRentMonthly,
    arrears_total: Math.max(0, grossRentMonthly - rentReceivedMonthly),
    opex_monthly: opexMonthly,
    net_cashflow_monthly: rentReceivedMonthly - opexMonthly - capexMonthly,
    occupancy_rate: Number(occupancyRate.toFixed(2)),
    upcoming_invoices_total: roundCurrency(dueSoonCompliance * 320 + openMaintenance * 540),
  }

  return {
    id: input.id,
    name: input.name,
    label: input.label,
    manager: input.manager,
    portfolio,
    properties,
    units,
    complianceRecords,
    documents,
    documentLinks,
    tasks,
    tenants,
    leases,
    maintenance,
    financials,
    transactions,
  }
}
