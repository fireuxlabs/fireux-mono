import type { TemplateOneBrandInjection } from './template-one'

const rootProps = (
  primary_color: string,
  secondary_color: string,
  source: string
) => ({ palette: { primary_color, secondary_color }, source })

const consoleValues = [
  'Light and dark canvas',
  'Light and dark text',
  'Title colour',
  'Body and title font intent',
] as const

export const landingTemplateBrands = [
  {
    id: 'root-kitchen',
    name: 'Root Kitchen',
    tier: 'root',
    demo: false,
    rootProps: rootProps(
      '#2563eb',
      '#ffffff',
      'Unassigned root-only model example using the default Misebox blue'
    ),
    atoms: { rule: { label: 'Rule · basic primary' } },
  },
  {
    id: 'pizza-the-action',
    name: 'Pizza the Action',
    tier: 'console',
    demo: true,
    rootProps: rootProps(
      '#1f6b45',
      '#f2c94c',
      'Pizza the Action Demo Place BrandPalette'
    ),
    consoleProps: {
      source: 'Current Kitchen.menus.style presentation evidence',
      values: consoleValues,
    },
    atoms: { rule: { label: 'Rule · console Kitchen primary' } },
  },
  {
    id: 'friiites',
    name: 'Friiites',
    tier: 'app',
    demo: false,
    rootProps: rootProps(
      '#d99a22',
      '#0b0b0a',
      'Friiites App identity projected as effective Kitchen palette'
    ),
    consoleProps: {
      source:
        'Inherited Kitchen presentation; dedicated Console theme not modelled yet',
      values: consoleValues,
    },
    appProps: {
      source: 'Friiites tenant App fixture',
      template: 'template-one',
      note: 'Real App consumer; template selection persistence remains to be modelled.',
    },
    atoms: { rule: { label: 'Rule · Friiites primary' } },
  },
  {
    id: 'deanos',
    name: "Deano's Smash",
    tier: 'console',
    demo: true,
    rootProps: rootProps(
      '#ff4f2e',
      '#181817',
      "Deano's Demo Place BrandPalette"
    ),
    consoleProps: {
      source: 'Deanos Demo Kitchen.menus.style',
      values: consoleValues,
    },
    appProps: {
      source: "Deano's incremental App preview fixture",
      template: 'template-one',
      note: 'Console Demo only; App data and evidence will be added incrementally.',
    },
    atoms: { rule: { label: "Rule · Deano's primary" } },
  },
] as const satisfies readonly TemplateOneBrandInjection[]

export const landingTemplates = [
  {
    slug: 'template-one',
    name: 'Template One',
    status: 'In development',
    summary: 'Root, Console and App Kitchen presentation through one template.',
    anatomy: ['Page', 'Scenes', 'Layers', 'Elements'],
    features: ['Root Kitchen palette', 'Console presentation', 'App template'],
    purchaseOptions: [
      {
        seller: 'FireUX',
        label: 'Request through FireUX',
        to: '/pricing/your-app',
      },
      {
        seller: 'Misebox',
        label: 'Request through Misebox',
        to: '/get-started',
      },
    ],
    brands: landingTemplateBrands,
  },
] as const

export const findLandingTemplate = (slug: string) =>
  landingTemplates.find((template) => template.slug === slug)
export const findLandingTemplateBrand = (id: string) =>
  landingTemplateBrands.find((brand) => brand.id === id)
export const isLandingTemplateBrandId = (
  value: string
): value is TemplateOneBrandInjection['id'] =>
  landingTemplateBrands.some((brand) => brand.id === value)
