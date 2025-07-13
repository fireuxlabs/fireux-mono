import type { ProfileConfig } from '../Card.vue'

export const supplierProfileConfig: ProfileConfig = {
  // Basic display configuration
  name_field: 'business_name',
  subtitle_field: 'business_type',
  description_field: 'bio_short',
  avatar_field: 'avatar',

  // Stats configuration
  stats: [
    {
      key: 'status',
      field: 'business_status',
      icon: 'i-heroicons-building-office',
      formatter: 'title',
    },
    {
      key: 'verification',
      field: 'verification_status',
      icon: 'i-heroicons-shield-check',
      formatter: 'title',
    },
    {
      key: 'minimum_order',
      field: 'delivery_options.minimum_order_value',
      icon: 'i-heroicons-currency-dollar',
      formatter: 'minimum_order',
    },
  ],

  // Badges configuration
  primary_badges: {
    field: 'product_categories',
    label: 'Products',
    variant: 'soft',
    formatter: 'title',
  },

  secondary_badges: {
    field: 'specialties',
    label: 'Specialties',
    variant: 'outline',
  },

  // Status configuration
  status: {
    field: 'business_status',
    mapping: {
      active: {
        text: 'Active business',
        icon: 'i-heroicons-check-circle',
        class: 'available',
        iconClass: 'available-icon',
        textClass: 'available-text',
      },
      pending: {
        text: 'Pending verification',
        icon: 'i-heroicons-clock',
        class: 'busy',
        iconClass: 'busy-icon',
        textClass: 'busy-text',
      },
      inactive: {
        text: 'Inactive',
        icon: 'i-heroicons-x-circle',
        class: 'unavailable',
        iconClass: 'unavailable-icon',
        textClass: 'unavailable-text',
      },
    },
  },

  // Location configuration
  location: {
    city_field: 'business_address.city',
    state_field: 'business_address.state',
  },

  // Custom sections
  custom_sections: [
    {
      key: 'delivery',
      field: 'delivery_options.delivery_methods',
      label: 'Delivery',
      formatter: 'title',
    },
  ],

  // Actions configuration
  actions: [
    {
      key: 'contact',
      label: 'Contact Supplier',
      variant: 'ghost',
      event: 'contact',
    },
    {
      key: 'view',
      label: 'View Catalog',
      variant: 'outline',
      event: 'view',
    },
  ],
}
