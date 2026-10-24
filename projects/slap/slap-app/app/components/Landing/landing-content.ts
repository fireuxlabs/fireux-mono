import type {
  LandingProductIndexContent,
  LandingProductSurface,
} from 'fireux-core/runtime/components/landing/product.types'

export const content = {
  hero: {
    title: 'The Storefront For',
    accent: ['Brand', 'Commerce'],
    description:
      'An integrated commerce platform connecting products, drops and stories directly to your Commerce Workspace. Build branded storefronts, publish collections, manage content and sell products.',
    primaryAction: { label: 'Get started', to: '/get-started' },
    secondaryAction: {
      label: 'Go to workspace',
      to: '/workspace',
      icon: 'i-lucide-layout-dashboard',
    },
    trustItems: [],
  },
} as const satisfies LandingProductIndexContent

export const surfaceItems = [
  {
    id: 'storefront',
    title: 'Storefront',
    description:
      'Publish products, collections and brand stories through the public App.',
    icon: 'i-lucide-store',
    to: '/products',
    action: 'Open storefront',
    items: ['Products', 'Collections', 'Stories', 'Brand presentation'],
  },
  {
    id: 'commerce-workspace',
    title: 'Commerce Workspace',
    description:
      'Manage the products and content that appear throughout the storefront.',
    icon: 'i-lucide-layout-dashboard',
    to: '/workspace',
    action: 'Open Commerce Workspace',
    items: ['Products', 'Content', 'Collections', 'Publishing'],
  },
] as const satisfies readonly LandingProductSurface[]
