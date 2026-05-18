import type { Portfolio } from '../../../../../models/portfolio.model'
import { PropertyManualModel } from '../../../../../models/property.model'
import type { Property, PropertyIdentity } from '../../../../../models/property.model'
import type { Unit } from '../../../../../models/unit.model'

export type DemoPortfolioProductFocus = 'granite' | 'buenohost'

export type DemoPortfolioListItem = {
  id: string
  name: string
  label: string
  image_url?: string
  product_focus?: DemoPortfolioProductFocus[]
}

export type DemoPortfolio = Portfolio & {
  image_url?: string
  product_focus?: DemoPortfolioProductFocus[]
}

export type DemoProperty = Property

type DemoPropertySeed = Omit<
  Property,
  'identity' | 'manual' | 'operator_ids' | 'slug'
> &
  PropertyIdentity & {
    operator_ids?: string[]
    slug?: string
  }

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

export type DemoGuestGuide = Record<string, unknown> & {
  id: string
  portfolio_id: string
  property_id: string
  slug: string
  title: string
  wifi_network?: string
  wifi_password?: string
  check_in?: string
  check_out?: string
  house_rules?: string[]
}

export type DemoStay = Record<string, unknown> & {
  id: string
  portfolio_id: string
  property_id: string
  guest_label: string
  check_in_date: string
  check_out_date: string
  status: 'booked' | 'checked_in' | 'checked_out'
}

export type DemoCleaningTask = Record<string, unknown> & {
  id: string
  portfolio_id: string
  property_id: string
  title: string
  status: 'todo' | 'in_progress' | 'done'
  due_date?: string
}

export type DemoGuestIssue = Record<string, unknown> & {
  id: string
  portfolio_id: string
  property_id: string
  title: string
  status: 'open' | 'in_progress' | 'done'
  priority: 'low' | 'medium' | 'high'
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
  guestGuides?: DemoGuestGuide[]
  stays?: DemoStay[]
  cleaningTasks?: DemoCleaningTask[]
  guestIssues?: DemoGuestIssue[]
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

const manual = (): Property['manual'] =>
  JSON.parse(JSON.stringify(PropertyManualModel)) as Property['manual']

const property = (seed: DemoPropertySeed): DemoProperty => {
  const {
    name,
    address_line,
    city,
    postcode,
    country,
    place_id,
    image_url,
    property_type,
    unit_count,
    estimated_value,
    estimated_value_currency,
    operator_ids,
    slug,
    ...rest
  } = seed

  return {
    ...rest,
    slug: slug ?? seed.id,
    operator_ids: operator_ids ?? [],
    identity: {
      name,
      address_line,
      city,
      postcode,
      country,
      place_id,
      image_url,
      property_type,
      unit_count,
      estimated_value,
      estimated_value_currency,
    },
    manual: manual(),
  }
}

const demoPortfolioScenarios: DemoPortfolioScenario[] = [
  {
    id: 'rivergate-estate',
    name: 'Rivergate Estate',
    label: 'Mixed-use city portfolio',
    product_focus: ['granite'],
    image_url:
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=320&h=320&q=80',
    portfolio: {
      name: 'Rivergate Estate',
      tagline: 'Mixed-use portfolio operations in London',
      slug: 'rivergate-estate',
      owner_label: 'Rivergate Holdings',
      strategy_label: 'Urban income and compliance',
      region_label: 'London',
      notes: 'Mixed-use portfolio for properties, documents, compliance, and tasks.',
    },
    properties: [
      property({
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
      }),
      property({
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
      }),
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
  {
    id: 'alpine-stay-collection',
    name: 'Alpine Stay Collection',
    label: 'Short-stay guest operations',
    product_focus: ['buenohost'],
    image_url:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=320&h=320&q=80',
    portfolio: {
      name: 'Alpine Stay Collection',
      tagline: 'Guest-ready property operations in Interlaken',
      slug: 'alpine-stay-collection',
      owner_label: 'Alpine Stay Partners',
      strategy_label: 'Short-stay readiness and smooth turnovers',
      region_label: 'Bernese Oberland',
      notes: 'Short-stay portfolio for guest guides, stays, cleaning, issues, and property operations.',
    },
    properties: [
      property({
        id: 'alpine-view-apartment',
        portfolio_id: 'alpine-stay-collection',
        name: 'Alpine View Apartment',
        address_line: '8 Chaletstrasse',
        city: 'Interlaken',
        postcode: '3800',
        country: 'Switzerland',
        place_id: 'demo-alpine-view-apartment',
        image_url:
          'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=320&h=240&q=80',
        property_type: 'residential',
        unit_count: 1,
        estimated_value: 740000,
        estimated_value_currency: 'CHF',
        status: 'active',
        created: stamp(),
        updated: updateStamp(),
      }),
      property({
        id: 'lakeside-studio',
        portfolio_id: 'alpine-stay-collection',
        name: 'Lakeside Studio',
        address_line: '14 Seestrasse',
        city: 'Thun',
        postcode: '3600',
        country: 'Switzerland',
        place_id: 'demo-lakeside-studio',
        image_url:
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=320&h=240&q=80',
        property_type: 'residential',
        unit_count: 1,
        estimated_value: 520000,
        estimated_value_currency: 'CHF',
        status: 'active',
        created: stamp(),
        updated: updateStamp(),
      }),
    ],
    units: [
      {
        id: 'alpine-view-whole-home',
        portfolio_id: 'alpine-stay-collection',
        property_id: 'alpine-view-apartment',
        label: 'Whole apartment',
        unit_type: 'flat',
        bedrooms: 2,
        bathrooms: 1,
        status: 'occupied',
        created: stamp(),
        updated: updateStamp(),
      },
      {
        id: 'lakeside-studio-main',
        portfolio_id: 'alpine-stay-collection',
        property_id: 'lakeside-studio',
        label: 'Studio',
        unit_type: 'flat',
        bedrooms: 1,
        bathrooms: 1,
        status: 'vacant',
        created: stamp(),
        updated: updateStamp(),
      },
    ],
    tenants: [],
    leases: [],
    financials: {
      currency: 'CHF',
      month_to_date_revenue: 12840,
      occupancy_rate: 0.82,
      cleaning_costs: 1640,
    },
    transactions: [
      {
        id: 'txn-alpine-stay-weekend',
        currency: 'CHF',
        amount: 1820,
        label: 'Weekend stay payout',
      },
      {
        id: 'txn-alpine-cleaning',
        currency: 'CHF',
        amount: -180,
        label: 'Turnover cleaning',
      },
    ],
    documents: [
      {
        id: 'doc-alpine-house-rules',
        portfolio_id: 'alpine-stay-collection',
        file_name: 'alpine-view-house-rules.pdf',
        file_type: 'application/pdf',
        size_bytes: 96000,
        storage_path: 'demo/alpine-stay/house-rules.pdf',
        download_url: '',
        uploaded_at: '2026-04-02',
      },
      {
        id: 'doc-alpine-cleaning-checklist',
        portfolio_id: 'alpine-stay-collection',
        file_name: 'alpine-turnover-checklist.pdf',
        file_type: 'application/pdf',
        size_bytes: 72000,
        storage_path: 'demo/alpine-stay/cleaning-checklist.pdf',
        download_url: '',
        uploaded_at: '2026-04-05',
      },
    ],
    documentLinks: [
      {
        id: 'link-alpine-house-rules',
        portfolio_id: 'alpine-stay-collection',
        document_id: 'doc-alpine-house-rules',
        target_type: 'property',
        target_id: 'alpine-view-apartment',
      },
    ],
    complianceRecords: [
      {
        id: 'compliance-alpine-smoke-alarms',
        portfolio_id: 'alpine-stay-collection',
        property_id: 'alpine-view-apartment',
        unit_id: 'alpine-view-whole-home',
        type_id: 'smoke-alarm-check',
        type_label: 'Smoke alarm check',
        provider: 'Host Safety Check',
        issue_date: '2026-03-22',
        expiry_date: '2026-09-22',
        document_id: '',
      },
    ],
    tasks: [
      {
        id: 'task-alpine-refresh-guide',
        portfolio_id: 'alpine-stay-collection',
        title: 'Refresh Alpine View check-in photos',
        status: 'open',
        source: 'manual',
        due_date: '2026-05-18',
        linked_entity_type: 'property',
        linked_entity_id: 'alpine-view-apartment',
      },
      {
        id: 'task-lakeside-restock-supplies',
        portfolio_id: 'alpine-stay-collection',
        title: 'Restock Lakeside Studio guest supplies',
        status: 'in_progress',
        source: 'manual',
        due_date: '2026-05-20',
        linked_entity_type: 'property',
        linked_entity_id: 'lakeside-studio',
      },
    ],
    guestGuides: [
      {
        id: 'guide-alpine-view-demo',
        portfolio_id: 'alpine-stay-collection',
        property_id: 'alpine-view-apartment',
        slug: 'alpine-view-stay',
        title: 'Alpine View Guest Guide',
        wifi_network: 'Alpine View Guest',
        wifi_password: 'alpine-view-2026',
        check_in: 'Check-in from 15:00 with the lobby code from your booking message.',
        check_out: 'Check out by 10:00, start the dishwasher, and return the key to the lockbox.',
        house_rules: [
          'Quiet hours are 22:00-07:00.',
          'No smoking inside the apartment.',
          'Report damage or maintenance issues as soon as possible.',
        ],
      },
    ],
    stays: [
      {
        id: 'stay-alpine-view-may-weekend',
        portfolio_id: 'alpine-stay-collection',
        property_id: 'alpine-view-apartment',
        guest_label: 'M. Fischer',
        check_in_date: '2026-05-15',
        check_out_date: '2026-05-18',
        status: 'checked_in',
      },
      {
        id: 'stay-lakeside-june-preview',
        portfolio_id: 'alpine-stay-collection',
        property_id: 'lakeside-studio',
        guest_label: 'S. Keller',
        check_in_date: '2026-06-03',
        check_out_date: '2026-06-06',
        status: 'booked',
      },
    ],
    cleaningTasks: [
      {
        id: 'clean-alpine-view-turnover',
        portfolio_id: 'alpine-stay-collection',
        property_id: 'alpine-view-apartment',
        title: 'Alpine View turnover clean',
        status: 'todo',
        due_date: '2026-05-18',
      },
      {
        id: 'clean-lakeside-refresh',
        portfolio_id: 'alpine-stay-collection',
        property_id: 'lakeside-studio',
        title: 'Lakeside Studio pre-arrival refresh',
        status: 'done',
        due_date: '2026-05-14',
      },
    ],
    guestIssues: [
      {
        id: 'issue-alpine-heating-note',
        portfolio_id: 'alpine-stay-collection',
        property_id: 'alpine-view-apartment',
        title: 'Guest asked for radiator instructions',
        status: 'in_progress',
        priority: 'medium',
      },
    ],
  },
  {
    id: 'city-nest-hosts',
    name: 'City Nest Hosts',
    label: 'Urban short-stay and owner reporting',
    product_focus: ['granite', 'buenohost'],
    image_url:
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=320&h=320&q=80',
    portfolio: {
      name: 'City Nest Hosts',
      tagline: 'Compact city properties with host and owner reporting',
      slug: 'city-nest-hosts',
      owner_label: 'City Nest Partners',
      strategy_label: 'Urban income, compliance, and short-stay growth',
      region_label: 'Manchester',
      notes: 'Crossover portfolio for Granite-style owner oversight and BuenoHost-style property operations.',
    },
    properties: [
      property({
        id: 'northern-quarter-loft',
        portfolio_id: 'city-nest-hosts',
        name: 'Northern Quarter Loft',
        address_line: '22 Tib Street',
        city: 'Manchester',
        postcode: 'M1 1AA',
        country: 'United Kingdom',
        place_id: 'demo-northern-quarter-loft',
        image_url:
          'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=320&h=240&q=80',
        property_type: 'residential',
        unit_count: 1,
        estimated_value: 430000,
        estimated_value_currency: 'GBP',
        status: 'active',
        created: stamp(),
        updated: updateStamp(),
      }),
      property({
        id: 'canal-side-apartment',
        portfolio_id: 'city-nest-hosts',
        name: 'Canal Side Apartment',
        address_line: '8 Cotton Wharf',
        city: 'Manchester',
        postcode: 'M4 2BB',
        country: 'United Kingdom',
        place_id: 'demo-canal-side-apartment',
        image_url:
          'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=320&h=240&q=80',
        property_type: 'residential',
        unit_count: 1,
        estimated_value: 385000,
        estimated_value_currency: 'GBP',
        status: 'active',
        created: stamp(),
        updated: updateStamp(),
      }),
    ],
    units: [
      {
        id: 'northern-quarter-whole-home',
        portfolio_id: 'city-nest-hosts',
        property_id: 'northern-quarter-loft',
        label: 'Whole loft',
        unit_type: 'flat',
        bedrooms: 1,
        bathrooms: 1,
        status: 'occupied',
        created: stamp(),
        updated: updateStamp(),
      },
      {
        id: 'canal-side-whole-home',
        portfolio_id: 'city-nest-hosts',
        property_id: 'canal-side-apartment',
        label: 'Whole apartment',
        unit_type: 'flat',
        bedrooms: 2,
        bathrooms: 1,
        status: 'vacant',
        created: stamp(),
        updated: updateStamp(),
      },
    ],
    tenants: [
      {
        id: 'tenant-city-nest-owner',
        property_id: 'northern-quarter-loft',
        unit_id: 'northern-quarter-whole-home',
        lease_id: 'lease-city-nest-management',
        monthly_rent: 0,
        status: 'managed',
      },
    ],
    leases: [
      {
        id: 'lease-city-nest-management',
        property_id: 'northern-quarter-loft',
        unit_id: 'northern-quarter-whole-home',
        tenant_id: 'tenant-city-nest-owner',
        end_date: '2027-01-31',
      },
    ],
    financials: {
      currency: 'GBP',
      month_to_date_revenue: 9240,
      owner_distribution_due: 6380,
      maintenance_costs: 640,
    },
    transactions: [
      {
        id: 'txn-city-nest-payout',
        currency: 'GBP',
        amount: 2240,
        label: 'Owner payout batch',
      },
      {
        id: 'txn-city-nest-maintenance',
        currency: 'GBP',
        amount: -210,
        label: 'Bathroom fan repair',
      },
    ],
    documents: [
      {
        id: 'doc-city-nest-management-agreement',
        portfolio_id: 'city-nest-hosts',
        file_name: 'city-nest-management-agreement.pdf',
        file_type: 'application/pdf',
        size_bytes: 148000,
        storage_path: 'demo/city-nest/management-agreement.pdf',
        download_url: '',
        uploaded_at: '2026-03-12',
      },
      {
        id: 'doc-canal-side-gas-safety',
        portfolio_id: 'city-nest-hosts',
        file_name: 'canal-side-gas-safety.pdf',
        file_type: 'application/pdf',
        size_bytes: 84000,
        storage_path: 'demo/city-nest/gas-safety.pdf',
        download_url: '',
        uploaded_at: '2026-02-28',
      },
    ],
    documentLinks: [
      {
        id: 'link-city-nest-management-agreement',
        portfolio_id: 'city-nest-hosts',
        document_id: 'doc-city-nest-management-agreement',
        target_type: 'portfolio',
        target_id: 'city-nest-hosts',
      },
      {
        id: 'link-canal-side-gas-safety',
        portfolio_id: 'city-nest-hosts',
        document_id: 'doc-canal-side-gas-safety',
        target_type: 'compliance-record',
        target_id: 'compliance-canal-side-gas-safety',
      },
    ],
    complianceRecords: [
      {
        id: 'compliance-canal-side-gas-safety',
        portfolio_id: 'city-nest-hosts',
        property_id: 'canal-side-apartment',
        unit_id: 'canal-side-whole-home',
        type_id: 'gas-safety',
        type_label: 'Gas safety certificate',
        provider: 'Metro Gas Safety',
        issue_date: '2026-02-28',
        expiry_date: '2027-02-28',
        document_id: 'doc-canal-side-gas-safety',
      },
    ],
    tasks: [
      {
        id: 'task-city-nest-owner-report',
        portfolio_id: 'city-nest-hosts',
        title: 'Send April owner report',
        status: 'open',
        source: 'manual',
        due_date: '2026-05-22',
        linked_entity_type: 'portfolio',
        linked_entity_id: 'city-nest-hosts',
      },
      {
        id: 'task-canal-side-guide',
        portfolio_id: 'city-nest-hosts',
        title: 'Add parking notes to Canal Side guide',
        status: 'in_progress',
        source: 'manual',
        due_date: '2026-05-19',
        linked_entity_type: 'property',
        linked_entity_id: 'canal-side-apartment',
      },
    ],
    guestGuides: [
      {
        id: 'guide-northern-quarter-loft',
        portfolio_id: 'city-nest-hosts',
        property_id: 'northern-quarter-loft',
        slug: 'northern-quarter-loft',
        title: 'Northern Quarter Loft Guest Guide',
        wifi_network: 'City Nest Guest',
        wifi_password: 'city-nest-demo',
        check_in: 'Self check-in is available from 16:00 using the smart lock.',
        check_out: 'Check out by 10:30 and leave keys in the hallway bowl.',
        house_rules: [
          'No parties or events.',
          'Keep building noise low after 22:00.',
          'Message the host before inviting extra guests.',
        ],
      },
    ],
    stays: [
      {
        id: 'stay-northern-quarter-business',
        portfolio_id: 'city-nest-hosts',
        property_id: 'northern-quarter-loft',
        guest_label: 'Business traveller',
        check_in_date: '2026-05-16',
        check_out_date: '2026-05-21',
        status: 'checked_in',
      },
    ],
    cleaningTasks: [
      {
        id: 'clean-northern-quarter-turnover',
        portfolio_id: 'city-nest-hosts',
        property_id: 'northern-quarter-loft',
        title: 'Loft turnover and linen reset',
        status: 'todo',
        due_date: '2026-05-21',
      },
    ],
    guestIssues: [
      {
        id: 'issue-canal-side-fan',
        portfolio_id: 'city-nest-hosts',
        property_id: 'canal-side-apartment',
        title: 'Bathroom fan is noisy',
        status: 'open',
        priority: 'low',
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
  product_focus: [...(scenario.product_focus ?? [])],
  guestGuides: scenario.guestGuides?.map((entry) => ({
    ...entry,
    house_rules: Array.isArray(entry.house_rules) ? [...entry.house_rules] : [],
  })),
  stays: scenario.stays?.map((entry) => ({ ...entry })),
  cleaningTasks: scenario.cleaningTasks?.map((entry) => ({ ...entry })),
  guestIssues: scenario.guestIssues?.map((entry) => ({ ...entry })),
})

const toPortfolio = (scenario: DemoPortfolioScenario): DemoPortfolio => {
  const id = normalizeString(scenario.id)
  const portfolio = scenario.portfolio ?? {}

  return {
    id,
    app_scope_state: 'root_only',
    app_scope_app_id: '',
    operator_ids: Array.isArray(portfolio.operator_ids)
      ? [...portfolio.operator_ids]
      : [],
    name:
      normalizeString(portfolio.name) || normalizeString(scenario.name) || id,
    tagline: normalizeString(portfolio.tagline),
    slug: normalizeString(portfolio.slug) || id,
    owner_label: normalizeString(portfolio.owner_label),
    status: portfolio.status === 'archived' ? 'archived' : 'active',
    strategy_label: normalizeString(portfolio.strategy_label),
    region_label: normalizeString(portfolio.region_label || scenario.label),
    notes: normalizeString(portfolio.notes),
    image_url: normalizeString(portfolio.image_url || scenario.image_url),
    product_focus: [...(scenario.product_focus ?? [])],
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
