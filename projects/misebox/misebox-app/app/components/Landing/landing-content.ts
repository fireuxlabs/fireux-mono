import type {
  LandingProductCatalogueContent,
  LandingProductIndexContent,
} from 'fireux-core/types/landing-product'

export type WorkspaceSurfaceCopy = {
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

export const workspaceSurfaceCopy = {
  'kitchen.dishes': {
    eyebrow: 'Kitchen Workspace · Dishes',
    title: 'Develop your dishes.',
    description:
      'Set each dish’s specification and selling price, connect its recipes and prep items, and track sales and costs.',
    items: ['Specification', 'Prep items', 'Recipes', 'Sales and costs'],
    action: 'Open Dishes',
    to: '/workspace/kitchen/food/dishes',
  },
  'kitchen.ingredients': {
    eyebrow: 'Kitchen Workspace · Ingredients',
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
    to: '/workspace/kitchen/food/ingredients',
  },
  'kitchen.menus': {
    eyebrow: 'Kitchen Workspace · Menus',
    title: 'Create your menus.',
    description:
      'Arrange dishes into ordering sections, choose how each menu is used, and publish QR codes for guests.',
    items: ['Ordering sections', 'Dishes', 'Ordering formats', 'QR codes'],
    action: 'Open Menus',
    to: '/workspace/kitchen/menus',
  },
  'kitchen.orders': {
    eyebrow: 'Kitchen Workspace · Orders',
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
    to: '/workspace/kitchen/orders',
  },
  'kitchen.recipes': {
    eyebrow: 'Kitchen Workspace · Recipes',
    title: 'Record your recipes.',
    description:
      'Record ingredients, quantities, methods and yields. Connect recipes to dishes.',
    items: ['Ingredients', 'Quantities', 'Method', 'Yield'],
    action: 'Open Recipes',
    to: '/workspace/kitchen/food/recipes',
  },
  'kitchen.stations': {
    eyebrow: 'Kitchen Workspace · Stations',
    title: 'Coordinate your stations.',
    description:
      'Assign dishes, prep tasks, and service work to the station responsible for completing them.',
    items: ['Dishes', 'Prep tasks', 'Service work', 'Responsibilities'],
    action: 'Open Stations',
    to: '/workspace/kitchen/stations',
  },
  'kitchen.suppliers': {
    eyebrow: 'Kitchen Workspace · Suppliers',
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
    to: '/workspace/kitchen/stock/suppliers',
  },
  'kitchen.finance': {
    eyebrow: 'Kitchen Workspace · Finance',
    title: 'Review Kitchen sales.',
    description:
      'Compare gross sales, completed sales, and average sale for the selected period.',
    supporting: 'Choose 7, 30, or 90 days. Each currency remains separate.',
    action: 'Open Kitchen Finance',
    to: '/workspace/kitchen/reports/finance',
  },
} as const satisfies Record<string, WorkspaceSurfaceCopy>

export const toolsCatalogue = {
  sectionId: 'misebox-tools',
  eyebrow: 'Tools',
  title: 'Order from a published Menu.',
  description:
    'Choose a published Menu. Collection, delivery, and pre-order appear only when the Menu and Kitchen enable them.',
  items: [
    {
      id: 'restaurant-labour-cost',
      title: 'Restaurant labour cost calculator',
      description:
        'Calculate total labour cost and labour percentage from sales and staffing costs.',
      icon: 'i-lucide-calculator',
      to: '/tools/restaurant-labour-cost',
      action: 'Open calculator',
    },
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
      'An integrated menu platform connecting QR and kiosk ordering directly to your Kitchen Workspace. Publish menus, process orders, and track food costs and sales.',
    primaryAction: {
      label: 'Get started',
      to: '/get-started',
    },
    secondaryAction: {
      label: 'Go to workspace',
      to: '/workspace/kitchen',
      icon: 'i-lucide-layout-dashboard',
    },
    trustItems: [],
  },
} as const satisfies LandingProductIndexContent
