import type { ReadOnlySupplierScenario } from '../_shared/types'

export const emberDistributionScenario = (): ReadOnlySupplierScenario => ({
  id: 'ember-distribution',
  name: 'Ember Distribution',
  label: 'Fire-led proteins and kitchen essentials',
  image_url:
    'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=320&h=320&q=80',
  coreSupplier: {
    id: 'ember-distribution',
    supplier_organization_name: 'Ember Distribution',
    organization_name: 'Ember Distribution',
    supplier_headline: 'Protein-first supply for high-volume service kitchens.',
    supplier_bio:
      'Read-only supplier scenario for butchery, proteins, oils, and service-led replenishment.',
    supplier_image:
      'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=320&h=320&q=80',
    supplier_product_categories: ['Proteins', 'Oils', 'Kitchen Essentials'],
    supplier_delivery_areas: ['Bern', 'Zurich', 'St. Gallen'],
    title: 'Ember Distribution',
    subtitle: 'Service-led wholesale',
    tagline: 'Protein, oils, and essentials',
    summary: 'Operational supplier scenario for fast-turn service kitchens.',
    business_type: 'Distributor',
    certifications: ['Temperature monitored', 'Invoice-ready exports'],
  },
  appSupplier: {
    id: 'ember-distribution',
    admin_ids: ['ops-ember'],
    join_requests: [],
    console_enabled: true,
  },
})
