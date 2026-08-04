export type PublicSupplier = {
  id: string
  organization_name: string
  tagline: string
  headline: string
  summary: string
  image_url: string
  categories: string[]
  delivery_areas: string[]
}

export type PublicSupplierItem = {
  id: string
  supplier_id: string
  product_id: string
  ingredient_id?: string
  name: string
  description: string
  image_url: string
  pack_size_label: string
  unit: string
  quantity_per_pack: number | null
  order_unit: string
  pack_cost_minor: number | null
  currency_code: string
  availability_state: string
  lead_time_days: number | null
  min_order_quantity: number | null
}

export type PublicSupplierDetail = PublicSupplier & {
  items: PublicSupplierItem[]
}

export type PublicSupplierIndex = {
  suppliers: PublicSupplier[]
}
