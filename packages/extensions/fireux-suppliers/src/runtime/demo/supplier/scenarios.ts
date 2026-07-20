// Concurrent edit — 2026-07-20 17:17 CEST — Demo Data Spine pass: keep only typed Supplier console targets.
// Concurrent edit — 2026-07-20 22:11 CEST — Both-Entity Authority — Supplier: keep demo roots aligned to access-free canonical Supplier shape.
import {
  SupplierModel,
  type Supplier,
} from '../../models/supplier/Supplier.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

const timestamp: FirebaseTimestamp = {
  seconds: 1_720_000_000,
  nanoseconds: 0,
}

const makeSupplier = (input: {
  id: string
  name: string
  headline: string
  categories: string[]
  state: Supplier['state']
}): Supplier => ({
  ...SupplierModel,
  id: input.id,
  app_scope_state: 'root_only',
  app_scope_app_id: '',
  company_id: '',
  slug: input.id,
  supplier_organization_name: input.name,
  tagline: '',
  supplier_headline: input.headline,
  summary: `${input.name} is a read-only console example.`,
  supplier_bio: '',
  supplier_image: '',
  supplier_item_categories: [...input.categories],
  supplier_delivery_areas: ['Switzerland'],
  state: input.state,
  catalogue_state: 'public_only',
  linked_ingredient_ids: [],
  hello: '',
  created: {
    at: timestamp,
    by: undefined,
    app_id: undefined,
  },
  updated: {
    at: timestamp,
    by: undefined,
  },
})

export const supplierDemoRecords: Supplier[] = [
  makeSupplier({
    id: 'city-butchers',
    name: 'City Butchers',
    headline: 'Whole cuts and daily meat deliveries',
    categories: ['Meat'],
    state: 'official',
  }),
  makeSupplier({
    id: 'green-larder',
    name: 'Green Larder',
    headline: 'Seasonal produce and kitchen herbs',
    categories: ['Produce', 'Herbs'],
    state: 'public',
  }),
]
