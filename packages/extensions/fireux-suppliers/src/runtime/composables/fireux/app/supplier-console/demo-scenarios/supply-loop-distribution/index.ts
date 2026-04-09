import {
  AppSupplierModel,
  SupplierModel,
} from 'fireux-suppliers/runtime/models/supplier/Supplier.model'
import type { DemoSupplierScenario } from '../_shared/types'

export const supplyLoopDistributionScenario = (): DemoSupplierScenario => ({
  id: 'supply-loop-distribution',
  name: 'Supply Loop Distribution',
  label: 'Proteins, oils, and kitchen essentials',
  image_url:
    'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=320&h=320&q=80',
  supplier: {
    ...SupplierModel,
    id: 'supply-loop-distribution',
    supplier_organization_name: 'Supply Loop Distribution',
    supplier_headline: 'Operational supply for high-volume service kitchens.',
    summary: 'Hospitality supplier scenario for proteins, oils, and replenishment cadence.',
    supplier_bio:
      'Read-only supplier scenario for proteins, oils, pantry rotation, and service-led replenishment.',
    supplier_image:
      'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=320&h=320&q=80',
    supplier_product_categories: ['Proteins', 'Oils', 'Kitchen Essentials'],
    supplier_delivery_areas: ['Bern', 'Zurich', 'St. Gallen'],
  },
  appSupplier: {
    ...AppSupplierModel,
    id: 'supply-loop-distribution',
    admin_ids: ['ops-supply-loop'],
    join_requests: [],
    console_enabled: true,
  },
})
