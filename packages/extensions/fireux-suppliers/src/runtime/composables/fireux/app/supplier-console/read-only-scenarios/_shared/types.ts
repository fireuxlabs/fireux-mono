export type ReadOnlySupplierCore = Record<string, unknown> & {
  id: string
  supplier_organization_name?: string
  supplier_headline?: string
  supplier_bio?: string
  supplier_image?: string
  supplier_product_categories?: string[]
  supplier_delivery_areas?: string[]
  title?: string
  subtitle?: string
  tagline?: string
  summary?: string
  organization_name?: string
  business_type?: string
  certifications?: string[]
}

export type ReadOnlySupplierApp = Record<string, unknown> & {
  id: string
  admin_ids?: string[]
  join_requests?: string[]
  console_enabled?: boolean
}

export type ReadOnlySupplierScenario = {
  id: string
  name: string
  label: string
  image_url: string
  coreSupplier: ReadOnlySupplierCore
  appSupplier: ReadOnlySupplierApp
}

export type ReadOnlySupplierScenarioListItem = {
  id: string
  name: string
  label: string
  image_url: string
  mode: 'read-only'
}
