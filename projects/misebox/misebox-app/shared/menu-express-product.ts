import type { ProductCreateInput } from 'fireux-products/runtime/product/utils/product'

/** Misebox's free document-hosting offer, fulfilled by the shared Menu tools. */
export const menuExpressProduct = {
  name: 'Menu Hosting',
  slug: 'menu-express',
  tagline: 'Your menu online for free, with a link and QR',
  description:
    'Upload your PDF or menu image, preview it, and publish it online for free. Get a Menu link and QR that stay the same when you replace your document.',
  content:
    '<p>Upload a PDF or image, preview your menu and publish it yourself for free. Share its online link and download the QR. Replace your document later without changing that link or printed QR.</p><p>No payment or Kitchen Workspace setup is required. Workspace brings the same Menu tools together with your other Kitchen tools. Structured preparation and diner ordering remain separate choices.</p>',
  visibility: 'public',
  active: true,
  product_type: 'service',
  requires_template: false,
  fulfillment_requirements: [
    'Menu source',
    'Venue details',
    'Document preview',
  ],
  categories: ['Menus'],
  brands: ['Misebox'],
  features: [
    {
      title: 'Document hosting',
      description: 'Use your PDF or menu image as the online Menu.',
      available: true,
    },
    {
      title: 'Preview and publish',
      description: 'Check your document and publish it yourself.',
      available: true,
    },
    {
      title: 'Public Menu and QR',
      description: 'Receive the published Menu link and downloadable QR.',
      available: true,
    },
  ],
} satisfies Partial<ProductCreateInput>
