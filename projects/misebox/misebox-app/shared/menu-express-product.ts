import type { ProductCreateInput } from 'fireux-products/runtime/product/utils/product'

/** Misebox's catalogue offer; commercial prices are agreed separately. */
export const menuExpressProduct = {
  name: 'Menu Express',
  slug: 'menu-express',
  tagline: 'Your menu, prepared for the web',
  description:
    'Send your menu as a PDF, photos or a link. We prepare a digital Menu, you review it, then receive its public link and QR.',
  content:
    '<p>Supply your menu and venue details. The Misebox team prepares a draft using the same Kitchen tools available in Workspace. Review the dishes and prices, request corrections, and approve the Menu before publication.</p><p>Price, scope and delivery terms are agreed before purchase. Submitting a request does not charge you. Ordering and payment collection from diners are separate services.</p>',
  visibility: 'public',
  active: true,
  product_type: 'service',
  requires_template: false,
  fulfillment_requirements: [
    'Menu source',
    'Venue details',
    'Customer approval',
  ],
  categories: ['Menus'],
  brands: ['Misebox'],
  features: [
    {
      title: 'Menu preparation',
      description: 'A Menu built from your supplied source.',
      available: true,
    },
    {
      title: 'Review before publication',
      description: 'Check content and request corrections before approving.',
      available: true,
    },
    {
      title: 'Public Menu and QR',
      description: 'Receive the published Menu link and downloadable QR.',
      available: true,
    },
  ],
} satisfies Partial<ProductCreateInput>
