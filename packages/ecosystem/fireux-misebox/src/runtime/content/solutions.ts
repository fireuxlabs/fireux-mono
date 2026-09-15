// Concurrent edit — 2026-07-21 12:08 CEST — Shared solutions catalogue: give Misebox one reusable authored source.
// Concurrent edit — 2026-07-21 13:47 CEST — Ingredient management solution: publish the proven Kitchen catalogue workflow.
import type { FireuxMetaSolution } from 'fireux-core/config/app/meta-content'

const owner = {
  id: 'misebox',
  name: 'Misebox',
  to: 'https://misebox.app',
} as const

export const miseboxSolutions = [
  {
    slug: 'digital-restaurant-menu',
    title: 'Digital restaurant menu',
    description:
      'Create one Kitchen and publish one online restaurant Menu for free without signing up.',
    icon: 'i-lucide-utensils',
    status: 'live',
    keywords: ['digital restaurant menu', 'online restaurant menu'],
    operationSlugs: ['menus'],
    body: 'Start with a Kitchen name, structure one Menu, and publish it as a public restaurant Menu. Misebox keeps the published Menu connected to its Kitchen instead of treating it as an isolated document.',
    steps: [
      'Start one Kitchen without signing up.',
      'Create and structure one Menu with sections, dishes, and prices.',
      'Publish the Menu for guests, then choose Premium if you need more than one Menu.',
    ],
    cta: { label: 'Start one Kitchen', to: '/workspace/kitchen' },
  },
  {
    slug: 'qr-menu-url',
    title: 'Menu URL QR',
    description: 'Paste an existing menu URL and get a printable QR menu.',
    icon: 'i-lucide-link',
    status: 'live',
    keywords: ['menu url qr', 'restaurant menu qr code'],
    cta: { label: 'Create QR', to: '/solutions/qr-menu-url' },
  },
  {
    slug: 'qr-menu',
    title: 'QR menu',
    description: 'Upload a menu, choose a short path, and get a QR menu.',
    icon: 'i-lucide-qr-code',
    status: 'live',
    keywords: ['qr menu', 'pdf menu qr code'],
    cta: { label: 'Upload menu', to: '/solutions/qr-menu' },
  },
  {
    slug: 'restaurant-menu-management',
    title: 'Restaurant menu management',
    description:
      'Create, structure, and publish one restaurant Menu for free, then choose Premium to manage multiple Menus.',
    icon: 'i-lucide-list-tree',
    status: 'live',
    keywords: [
      'restaurant menu management software',
      'menu management software',
    ],
    operationSlugs: ['menus'],
    body: 'Misebox connects Menu sections, dishes, prices, publication status, and public presentation to one Kitchen. The open Workspace lets you start one Kitchen and one Menu without signing up.',
    steps: [
      'Start a Kitchen and create its first Menu.',
      'Organise sections, dishes, prices, availability, and presentation.',
      'Publish the Menu, or choose Premium when the Kitchen needs multiple Menus.',
    ],
    cta: { label: 'Open kitchen workspace', to: '/workspace/kitchen/menus' },
  },
  {
    slug: 'restaurant-menu-builder',
    title: 'Restaurant menu builder',
    description:
      'Build and publish one restaurant Menu from sections, dishes, prices, and presentation settings without signing up.',
    icon: 'i-lucide-panels-top-left',
    status: 'live',
    keywords: [
      'restaurant menu builder',
      'online menu builder for restaurants',
    ],
    operationSlugs: ['menus'],
    body: 'Use the open Kitchen Workspace as an online restaurant Menu builder. Start with one Kitchen, arrange the Menu you serve, and publish it for guests.',
    steps: [
      'Name the Kitchen that owns the Menu.',
      'Add sections, dishes, prices, and public presentation.',
      'Publish one Menu for free; choose Premium to create and manage additional Menus.',
    ],
    cta: { label: 'Create menu', to: '/workspace/kitchen/menus' },
  },
  {
    slug: 'allergen-menu-software',
    title: 'Allergen menu software',
    description:
      'Connect allergen and dietary information to dishes and public menu display.',
    icon: 'i-lucide-shield-check',
    status: 'planned',
    keywords: ['allergen menu software', 'restaurant allergen menu'],
    operationSlugs: ['dishes', 'ingredients', 'menus'],
  },
  {
    slug: 'multilingual-restaurant-menu',
    title: 'Multilingual restaurant menu',
    description:
      'Publish restaurant menus in more than one language with translation support.',
    icon: 'i-lucide-languages',
    status: 'bridge',
    keywords: ['multilingual restaurant menu', 'restaurant menu translation'],
    operationSlugs: ['menus'],
    relatedApp: {
      name: 'Sproochli',
      to: 'https://sproochli.web.app',
      external: true,
      description:
        'Sproochli owns translation-ready public pages and language workflows.',
    },
    cta: {
      label: 'Prepare translation',
      to: '/solutions/multilingual-restaurant-menu',
    },
  },
  {
    slug: 'restaurant-ingredient-management',
    title: 'Restaurant ingredient management',
    description:
      'A dedicated ingredient workspace for each kitchen, designed around one reusable ingredient library.',
    icon: 'i-lucide-carrot',
    status: 'coming-soon',
    body: 'Coming soon. The catalogue and add-by-name workflow are in place; final data access and detail linking are still being completed before launch.',
    steps: [
      'Choose the kitchen whose ingredient catalogue you want to organise.',
      'Enter an ingredient name to reuse an exact shared record or create one when missing.',
      'Keep the kitchen selection separate while the ingredient record stays reusable.',
    ],
    keywords: [
      'restaurant ingredient management',
      'kitchen ingredient management',
    ],
    operationSlugs: ['ingredients'],
    cta: { label: 'See ingredient operation', to: '/operations/ingredients' },
  },
  {
    slug: 'recipe-management-software',
    title: 'Recipe management software',
    description:
      'Store kitchen recipes with yields, ingredient lines, steps, and dish links.',
    icon: 'i-lucide-notebook-tabs',
    status: 'live',
    keywords: ['recipe management software', 'restaurant recipe management'],
    operationSlugs: ['recipes'],
    cta: { label: 'Open recipes', to: '/workspace/kitchen/recipes' },
  },
  {
    slug: 'kitchen-team-management',
    title: 'Kitchen team management',
    description:
      'Manage kitchen roles, stations, access, and team responsibilities.',
    icon: 'i-lucide-users',
    status: 'planned',
    keywords: ['kitchen team management', 'restaurant team management'],
    cta: { label: 'Open team', to: '/workspace/kitchen/team' },
  },
  {
    slug: 'restaurant-supplier-management',
    title: 'Restaurant supplier management',
    description:
      'Connect suppliers, ingredients, products, sourcing, and kitchen needs.',
    icon: 'i-lucide-truck',
    status: 'planned',
    keywords: [
      'restaurant supplier management',
      'restaurant supplier software',
    ],
    operationSlugs: ['suppliers'],
    cta: { label: 'Open suppliers', to: '/workspace/kitchen/suppliers' },
  },
  {
    slug: 'restaurant-hiring-software',
    title: 'Restaurant hiring software',
    description:
      'Publish hospitality roles and connect kitchens with chefs and professionals.',
    icon: 'i-lucide-briefcase-business',
    status: 'live',
    keywords: ['restaurant hiring software', 'hospitality hiring software'],
    cta: { label: 'Open jobs', to: '/jobs' },
  },
  {
    slug: 'chef-profile-page',
    title: 'Chef profile page',
    description:
      'Create a public chef profile that shows experience, roles, and kitchen fit.',
    icon: 'i-lucide-chef-hat',
    status: 'live',
    keywords: ['chef profile page', 'chef portfolio profile'],
    cta: { label: 'Browse chefs', to: '/chefs' },
  },
  {
    slug: 'restaurant-profile-page',
    title: 'Restaurant profile page',
    description:
      'Show a kitchen, menu, location, team identity, and hiring context.',
    icon: 'i-lucide-store',
    status: 'live',
    keywords: ['restaurant profile page', 'kitchen profile page'],
    cta: { label: 'Open kitchens', to: '/kitchens' },
  },
  {
    slug: 'restaurant-operations-software',
    title: 'Restaurant operations software',
    description:
      'Run menus, dishes, recipes, prep, team, suppliers, orders, and hiring from one kitchen workspace.',
    icon: 'i-lucide-layout-dashboard',
    status: 'planned',
    keywords: ['restaurant operations software', 'kitchen operations software'],
    operationSlugs: [
      'menus',
      'dishes',
      'recipes',
      'mise',
      'orders',
      'suppliers',
    ],
    cta: { label: 'Open workspace', to: '/workspace/kitchen' },
  },
] satisfies FireuxMetaSolution[]

export const fireuxMiseboxSolutions = miseboxSolutions.map((solution) => ({
  ...solution,
  owner,
  to: `https://misebox.app/solutions/${solution.slug}`,
  external: true,
})) satisfies FireuxMetaSolution[]
