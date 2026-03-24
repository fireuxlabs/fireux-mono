import type { ReadOnlySupplierScenario } from '../_shared/types'

export const harborProvisionsScenario = (): ReadOnlySupplierScenario => ({
  id: 'harbor-provisions',
  name: 'Harbor Provisions',
  label: 'Coastal produce and dry goods',
  image_url:
    'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=320&h=320&q=80',
  coreSupplier: {
    id: 'harbor-provisions',
    supplier_organization_name: 'Harbor Provisions',
    organization_name: 'Harbor Provisions',
    supplier_headline: 'Daily coastal produce and pantry staples.',
    supplier_bio:
      'Read-only supplier scenario focused on short-lead produce, seafood, and core pantry supply.',
    supplier_image:
      'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=320&h=320&q=80',
    supplier_product_categories: ['Produce', 'Seafood', 'Dry Goods'],
    supplier_delivery_areas: ['Zurich', 'Basel', 'Lucerne'],
    title: 'Harbor Provisions',
    subtitle: 'Fresh coastal sourcing',
    tagline: 'Produce, seafood, and pantry staples',
    summary: 'Reliable daily supply across produce, seafood, and dry goods.',
    business_type: 'Wholesale supplier',
    certifications: ['Cold-chain compliant', 'Same-day dispatch'],
  },
  appSupplier: {
    id: 'harbor-provisions',
    admin_ids: ['ops-harbor'],
    join_requests: [],
    console_enabled: true,
  },
})
