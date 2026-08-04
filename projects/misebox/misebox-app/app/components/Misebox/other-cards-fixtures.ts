import { miseboxDemoMediaUrl } from 'fireux-demo/runtime/media/misebox'
import type { PublicMenuIndexItem } from 'fireux-kitchens/runtime/models/kitchen/menu/menu-index.model'

export const dishImage = miseboxDemoMediaUrl('kitchens/deanos/menu/deanos-classic.jpg')
export const ingredientImage = '/img/showcase/ingredients/beef-mince.jpg'
export const routeScope = { kind: 'root' } as const

export const placeCard = {
  id: 'interlaken',
  to: '/',
  name: 'Interlaken',
  formattedAddress: '3800 Interlaken, Switzerland',
  imageUrl: dishImage,
  imageShade: 'dark' as const,
  source: 'fireux' as const,
  prop: 'Between Lake Thun and Lake Brienz.',
}
export const placePill = {
  to: '/',
  title: 'Interlaken',
  shortName: 'Interlaken',
  subtitle: 'Bernese Oberland',
  imageUrl: dishImage,
  imageShade: 'dark' as const,
  badges: ['Switzerland'],
}
export const placePreview = {
  imageUrl: dishImage,
  imageShade: 'dark' as const,
  name: 'Interlaken',
  formattedAddress: '3800 Interlaken, Switzerland',
  source: 'fireux' as const,
  prop: 'Between Lake Thun and Lake Brienz.',
  details: [{ label: 'Region', value: 'Bernese Oberland' }],
}

export const kitchenPill = {
  to: '/',
  title: 'Card Specimen Kitchen',
  subtitle: 'Sample venue',
  imageUrl: dishImage,
  imageShade: 'dark' as const,
}
export const kitchenPreview = {
  imageUrl: dishImage,
  imageShade: 'dark' as const,
  name: 'Card Specimen Kitchen',
  formattedAddress: 'Sample venue, Switzerland',
  shortAddress: 'Sample venue',
  prop: 'Generic content for comparing card variants.',
  currencyCode: 'CHF',
  details: [
    { label: 'Menu', value: 'Main Menu' },
    { label: 'Team', value: '3 sample members' },
  ],
}

export const menu = {
  id: 'card-specimen-menu',
  name: 'Main Menu',
  description: 'Smash burgers, crispy chicken, loaded sides, and shakes.',
  status: 'published',
  contexts: ['generic', 'collection', 'kiosk'],
  kitchen: {
    name: 'Card Specimen Kitchen',
    image_url: dishImage,
    image_shade: 'dark',
  },
  source: {
    app_id: 'misebox-app',
    kitchen_id: 'card-specimen-kitchen',
    menu_id: 'card-specimen-menu',
    kitchen_slug: 'card-specimen-kitchen',
    kitchen_name: 'Card Specimen Kitchen',
  },
} as const satisfies PublicMenuIndexItem

export const ingredientCard = {
  slug: 'beef-mince',
  to: '/',
  name: 'Ground beef',
  subtitle: 'Meat',
  status: 'Active',
  imageUrl: ingredientImage,
}
export const ingredientPreview = {
  imageUrl: ingredientImage,
  name: 'Ground beef',
  subtitle: 'Meat',
  status: 'Active',
  prop: 'Portioned into burger balls before service.',
  badges: ['Burger mise'],
  details: [{ label: 'Kitchen use', value: 'Burger station' }],
}

export const chefCard = {
  to: '/',
  avatarUrl: '',
  secondaryAvatarUrl: '',
  displayName: 'Ana Müller',
  handle: '@ana-muller',
  title: 'Chef de Partie',
  badges: ['Grill', 'Mise en place'],
  summary: 'Hot-station chef focused on service and prep.',
}
export const customerCard = {
  avatarUrl: '',
  secondaryAvatarUrl: '',
  displayName: 'Sofia Keller',
  title: 'Regular customer',
  badges: ['Collection'],
  summary: 'Usually orders the Deanos Classic.',
}
export const driverCard = {
  to: '/',
  avatarUrl: '',
  secondaryAvatarUrl: '',
  displayName: 'Marco Frei',
  handle: '@marco-frei',
  title: 'Delivery driver',
  badges: ['Interlaken'],
  summary: 'Local delivery coverage around Interlaken.',
}
export const miseCell = {
  to: '/',
  name: 'Burger patties',
  subtitle: '80 g beef balls',
  description: 'Portion ground beef into loose balls and hold chilled.',
}
export const misePill = {
  to: '/',
  title: 'Burger patties',
  subtitle: 'Portion before service',
  imageUrl: '',
  icon: 'i-lucide-list-checks',
  hasMissingTitle: false,
}
export const kitchenSupplierCell = {
  id: 'alpine-foods',
  to: '/',
  title: 'Alpine Foods',
  subtitle: 'Interlaken',
  avatarUrl: ingredientImage,
  badges: ['Meat', 'Dairy'],
  summary: 'Local food supplier with weekday deliveries.',
}

export const supplierCard = {
  to: '/',
  avatarUrl: ingredientImage,
  imageUrl: ingredientImage,
  title: 'Alpine Foods',
  subtitle: 'Interlaken',
  badges: ['Meat', 'Dairy'],
  summary: 'Local food supplier with weekday deliveries.',
  organizationName: 'Alpine Foods GmbH',
  locationsLabel: 'Interlaken · Matten',
  categoriesCsv: 'Meat, Dairy, Produce',
}
export const supplierItemCard = {
  to: '/',
  imageUrl: ingredientImage,
  title: 'Ground beef 80/20',
  subtitle: 'Alpine Foods',
  badges: ['Fresh'],
  packPriceLabel: 'CHF 82.50',
  unitPriceLabel: 'CHF 16.50',
  unit: 'kg',
  packLabel: '5 kg case',
  productId: 'beef-mince-80-20',
  ingredientId: 'beef-mince',
}

export const agentCard = {
  to: '/',
  avatarUrl: '',
  secondaryAvatarUrl: '',
  displayName: 'Alpine Hospitality',
  handle: '@alpine-hospitality',
  title: 'Hospitality recruiter',
  badges: ['Bernese Oberland'],
  summary: 'Restaurant staffing across the region.',
}
export const jobCard = {
  to: '/',
  title: 'Chef de Partie',
  subtitle: 'Deanos Kitchen · Interlaken',
  description: 'Join the hot section for a busy summer service.',
  badges: ['Full time', 'Kitchen'],
  status: 'open',
  imageUrl: dishImage,
  compensationLabel: 'CHF 5,200 / month',
  openingsLabel: '1 opening',
  contractTypeLabel: 'Permanent',
  managementModeLabel: 'Direct hire',
  scheduleLabel: 'From August 2026',
}
export const professionalCard = {
  to: '/',
  avatarUrl: '',
  secondaryAvatarUrl: '',
  image: '',
  imageUrl: '',
  displayName: 'Ana Müller',
  handle: '@ana-muller',
  title: 'Chef de Partie',
  badges: ['Grill', 'Prep'],
  summary: 'Kitchen professional focused on organised, fast service.',
}
