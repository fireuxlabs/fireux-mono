import type {
  LandingProductCatalogueContent,
  LandingProductIndexContent,
} from 'fireux-core/types/landing-product'

export type ConsoleSurfaceCopy = {
  action: string
  description?: string
  eyebrow: string
  items?: readonly string[]
  supporting?: string
  title: string
  to: string
}

export const featuredAppIds = [
  'baeren-ringgenberg',
  'interlaken-essen',
  'la-tap-berne',
] as const
export const featuredAppMedia = {
  'baeren-ringgenberg': {
    coverUrl: 'https://baeren-ringgenberg.web.app/img/app/background.png',
    logoUrl: 'https://baeren-ringgenberg.web.app/img/app/logo.png',
    mediaLabel: 'Hotel Bären Ringgenberg',
    wordmarkUrl: 'https://baeren-ringgenberg.web.app/img/app/wordmark-dark.png',
  },
  'interlaken-essen': {
    coverUrl: 'https://interlaken-essen.misebox.app/img/app/cover.png',
    logoUrl: 'https://interlaken-essen.misebox.app/img/app/logo.png',
  },
  'la-tap-berne': {
    coverUrl: 'https://tapberne.misebox.app/img/gallery/image-1.png',
    logoUrl: 'https://tapberne.misebox.app/img/app/logo.png',
    wordmarkUrl: 'https://tapberne.misebox.app/img/app/wordmark-dark.png',
  },
} as const

export const consoleSurfaceCopy = {
  'kitchen.dishes': {
    eyebrow: 'Kitchen Console · Dishes',
    title: 'Develop your dishes.',
    description:
      'Set each dish’s specification and selling price, connect its recipes and prep items, organise mise en place, and track sales and costs.',
    items: [
      'Specification',
      'Prep items',
      'Recipes',
      'Mise en place',
      'Sales and costs',
    ],
    action: 'Open Dishes',
    to: '/console/kitchen/dishes',
  },
  'kitchen.ingredients': {
    eyebrow: 'Kitchen Console · Ingredients',
    title: 'Connect your ingredients.',
    description:
      'Connect the ingredients a Kitchen uses to dishes, recipes, prep items, and available supplier offers.',
    items: [
      'Kitchen ingredients',
      'Dishes and recipes',
      'Prep items',
      'Supplier offers',
    ],
    action: 'Open Ingredients',
    to: '/console/kitchen/ingredients',
  },
  'kitchen.menus': {
    eyebrow: 'Kitchen Console · Menus',
    title: 'Create your menus.',
    description:
      'Arrange dishes into ordering sections, choose how each menu is used, and publish QR codes for guests.',
    items: ['Ordering sections', 'Dishes', 'Ordering formats', 'QR codes'],
    action: 'Open Menus',
    to: '/console/kitchen/menus',
  },
  'kitchen.mise': {
    eyebrow: 'Kitchen Console · Mise',
    title: 'Prepare for service.',
    description:
      'Create prep tasks from dishes and recipes, assign them to stations, set quantities, and track completion before service.',
    items: ['Prep tasks', 'Quantities', 'Stations', 'Completion'],
    action: 'Open Mise',
    to: '/console/kitchen/mise',
  },
  'kitchen.orders': {
    eyebrow: 'Kitchen Console · Orders',
    title: 'Process your orders.',
    description:
      'Receive orders from every ordering surface, organise the service queue, and track each order from acceptance to handoff.',
    items: [
      'Incoming orders',
      'Service queue',
      'Preparation status',
      'Handoff',
    ],
    action: 'Open Orders',
    to: '/console/kitchen/orders',
  },
  'kitchen.recipes': {
    eyebrow: 'Kitchen Console · Recipes',
    title: 'Record your recipes.',
    description:
      'Record ingredients, quantities, methods and yields. Connect recipes to dishes.',
    items: ['Ingredients', 'Quantities', 'Method', 'Yield'],
    action: 'Open Recipes',
    to: '/console/kitchen/recipes',
  },
  'kitchen.stations': {
    eyebrow: 'Kitchen Console · Stations',
    title: 'Coordinate your stations.',
    description:
      'Assign dishes, prep tasks, and service work to the station responsible for completing them.',
    items: ['Dishes', 'Prep tasks', 'Service work', 'Responsibilities'],
    action: 'Open Stations',
    to: '/console/kitchen/stations',
  },
  'kitchen.suppliers': {
    eyebrow: 'Kitchen Console · Suppliers',
    title: 'Source your ingredients.',
    description:
      'Review suppliers linked to the selected Kitchen, their catalogues, covered ingredients, and available pack offers.',
    items: [
      'Linked suppliers',
      'Catalogues',
      'Ingredient links',
      'Pack offers',
    ],
    action: 'Open Suppliers',
    to: '/console/kitchen/suppliers',
  },
  'kitchen.tables': {
    eyebrow: 'Kitchen Console · Tables',
    title: 'Review your tables.',
    description:
      'Review the table numbers configured for the selected Kitchen. Demo leaves tabs and billing empty until a real Table producer exists.',
    items: [
      'Configured table numbers',
      'Selected-Kitchen scope',
      'No invented tabs',
      'No invented billing',
    ],
    action: 'Open Tables',
    to: '/console/kitchen/tables',
  },
  'kitchen.finance': {
    eyebrow: 'Kitchen Console · Finance',
    title: 'Review Kitchen sales.',
    description:
      'Compare gross sales, completed sales, and average sale for the selected period.',
    supporting: 'Choose 7, 30, or 90 days. Each currency remains separate.',
    action: 'Open Kitchen Finance',
    to: '/console/kitchen/finance',
  },
} as const satisfies Record<string, ConsoleSurfaceCopy>

export const toolsCatalogue = {
  sectionId: 'misebox-tools',
  eyebrow: 'Tools',
  title: 'Order from a published Menu.',
  description:
    'Choose a published Menu. Collection, delivery, and pre-order appear only when the Menu and Kitchen enable them.',
  items: [
    {
      id: 'ordering',
      title: 'Ordering',
      description:
        'Choose a published Menu and start an available customer order.',
      icon: 'i-lucide-shopping-basket',
      to: '/tools/ordering',
      action: 'Open tool',
    },
  ],
} satisfies LandingProductCatalogueContent

export const content = {
  hero: {
    title: 'The Control Centre For',
    accent: ['Kitchen', 'Operations'],
    description:
      'An integrated menu platform connecting QR and kiosk ordering directly to your Kitchen Console. Publish menus, manage recipes and mise en place, process orders, and track food costs and sales.',
    primaryAction: {
      label: 'Get started',
      to: '/get-started',
    },
    secondaryAction: {
      label: 'Go to console',
      to: '/console/kitchen',
      icon: 'i-lucide-layout-dashboard',
    },
    trustItems: [],
  },
} as const satisfies LandingProductIndexContent
