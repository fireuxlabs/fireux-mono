import { resolveAppPalette } from 'fireux-core/runtime/utils/brand-palette'
import {
  projectTemplateOneKitchen,
  type TemplateOneFlagshipDish,
  type TemplateOneKitchenProjection,
  type TemplateOneKitchenSpecimen,
  type TemplateOneMenuContent,
} from '../models/template-one'

type TemplateOneMediaResolver = (path: string) => string

export const createTemplateOneFixtureProjection = (input: {
  kitchen: TemplateOneKitchenSpecimen
  menu: TemplateOneMenuContent
  flagshipDish: TemplateOneFlagshipDish | null
  media: TemplateOneMediaResolver
  wordmarkSrc?: string
}): TemplateOneKitchenProjection => {
  const { kitchen, media } = input
  if (!kitchen.workspaceProps || !kitchen.appProps)
    throw new Error(`${kitchen.name} is not configured for Template One`)
  const palette = resolveAppPalette(
    kitchen.workspaceProps.palette,
    kitchen.appProps.palette
  )
  if (!palette)
    throw new Error(`${kitchen.name} has no effective Template One palette`)
  const isFriiites = kitchen.id === 'friiites'
  const asset = (friiites: string, deanos: string) =>
    media(isFriiites ? friiites : deanos)
  return projectTemplateOneKitchen({
    id: kitchen.id,
    name: kitchen.name,
    placePrimaryColor: kitchen.rootProps.placePrimaryColor,
    wordmarkSrc: input.wordmarkSrc || media('wordmark-dark.png'),
    palette,
    typography: kitchen.appProps.typography,
    flagshipDish: input.flagshipDish,
    hero: kitchen.appProps.sceneOne,
    menu: input.menu,
    ordering: {
      artifacts: [
        { src: asset('branding/table-qr-stand.png', 'menu/deanos-classic.jpg'), alt: `${kitchen.name} ordering point` },
        { src: asset('packaging/carton-empty.webp', 'menu/skin-on-fries.jpg'), alt: `${kitchen.name} signature serve` },
        { src: asset('branding/takeaway-bag.png', 'menu/dirty-deanos-fries.jpg'), alt: `${kitchen.name} takeaway` },
      ],
      surfaces: [
        { label: 'Table', icon: 'i-lucide-utensils', description: 'Order from your table.', action: 'Table menu', to: isFriiites ? '/friiites.table' : '#menu' },
        { label: 'Kiosk', icon: 'i-lucide-monitor', description: 'Build your order on the in-store screen.', action: 'Kiosk menu', to: isFriiites ? '/friiites.kiosk' : '#menu' },
        { label: 'Delivery', icon: 'i-lucide-bike', description: 'Send your order to your door.', action: 'Delivery menu', to: isFriiites ? '/friiites.delivery' : '#menu' },
        { label: 'Collection', icon: 'i-lucide-shopping-bag', description: 'Order ahead and collect.', action: 'Collection menu', to: isFriiites ? '/friiites.collection' : '#menu' },
        { label: 'Counter', icon: 'i-lucide-chef-hat', description: 'Order with the team at the counter.', action: 'Staff sign in', to: isFriiites ? '/auth' : '#menu' },
      ],
    },
    franchise: {
      title: 'Franchise',
      description: `Bring ${kitchen.name} to your community.`,
      actionLabel: 'Franchise enquiries',
      media: [
        { src: asset('branding/staff-apron.png', 'menu/hot-honey-chicken.jpg'), alt: `${kitchen.name} team` },
        { src: asset('branding/storefront-fascia.png', 'menu/double-trouble.jpg'), alt: `${kitchen.name} storefront` },
        { src: asset('branding/takeaway-bag.png', 'menu/skin-on-fries.jpg'), alt: `${kitchen.name} packaging` },
      ],
    },
    provider: {
      title: 'Powered by Misebox',
      description: `The kitchen system behind ${kitchen.name}.`,
      href: 'https://misebox.app',
      wordmarkLightSrc: '/img/ecosystem/wordmark-light.png',
      wordmarkDarkSrc: '/img/ecosystem/wordmark-dark.png',
      name: 'Misebox',
    },
    footer: {
      eyebrow: 'Kitchen operations',
      title: `Manage ${kitchen.name} in Misebox.`,
      description: 'Menus, dishes, recipes, preparation and orders stay connected in the Kitchen Workspace.',
      workspaceTo: isFriiites ? '/' : '/get-started',
      workspaceLabel: 'Enter Workspace',
      origin: `${kitchen.name} · Developed in Switzerland`,
      links: [
        { label: 'Menu', to: '#menu' },
        { label: 'Order', to: '#order-now' },
        { label: 'Franchise', to: '#franchise' },
      ],
    },
  })
}
