import type { ProfileConfig } from '../Card.vue'

export const chefProfileConfig: ProfileConfig = {
  // Basic display configuration
  name_field: 'chef_name',
  subtitle_field: 'title',
  description_field: 'bio_short',
  avatar_field: 'avatar',

  // Stats configuration
  stats: [
    {
      key: 'experience',
      field: 'kitchen_experience',
      icon: 'i-heroicons-clock',
      formatter: 'experience',
    },
    {
      key: 'employment',
      field: 'employment_status',
      icon: 'i-heroicons-briefcase',
      formatter: 'title',
    },
    {
      key: 'rate',
      field: 'hourly_rate.min',
      icon: 'i-heroicons-currency-dollar',
      formatter: 'hourly_rate',
    },
  ],

  // Badges configuration
  primary_badges: {
    field: 'specialties',
    label: 'Specialties',
    variant: 'soft',
  },

  secondary_badges: {
    field: 'dietary_accommodations',
    label: 'Dietary',
    variant: 'outline',
  },

  // Status configuration
  status: {
    field: 'employment_status',
    mapping: {
      available: {
        text: 'Available for hire',
        icon: 'i-heroicons-check-circle',
        class: 'available',
        iconClass: 'available-icon',
        textClass: 'available-text',
      },
      employed: {
        text: 'Currently employed',
        icon: 'i-heroicons-clock',
        class: 'busy',
        iconClass: 'busy-icon',
        textClass: 'busy-text',
      },
      unavailable: {
        text: 'Not available',
        icon: 'i-heroicons-x-circle',
        class: 'unavailable',
        iconClass: 'unavailable-icon',
        textClass: 'unavailable-text',
      },
    },
  },

  // Location configuration
  location: {
    city_field: 'address.city',
    state_field: 'address.state',
  },

  // Actions configuration
  actions: [
    {
      key: 'contact',
      label: 'Contact Chef',
      variant: 'ghost',
      event: 'contact',
    },
    {
      key: 'view',
      label: 'View Profile',
      variant: 'outline',
      event: 'view',
    },
  ],
}
