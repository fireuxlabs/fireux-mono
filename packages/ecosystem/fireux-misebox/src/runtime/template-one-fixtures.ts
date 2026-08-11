import type { TemplateOneKitchenSpecimen } from './template-one'
import type { TemplateOneMenuSample } from './template-one'
import { MISEBOX_BASIC_PRIMARY_COLOR } from './kitchen-basic-presentation'

const deanosWordmarkSrc =
  'https://firebasestorage.googleapis.com/v0/b/misebox-78f9c.appspot.com/o/demo%2Fmisebox-app%2Fkitchens%2Fdeanos%2Flogo.png?alt=media&token=f71ae1d8-4b0e-4d0c-8b65-cc99580a6c60'

export const templateOneMenuSample = {
  sections: [
    {
      id: 'small-plates',
      label: 'Small plates',
      items: [
        {
          id: 'roasted-tomato-toast',
          dishId: '',
          itemKind: 'food',
          isDeal: false,
          name: 'Roasted tomato toast',
          description: 'Heritage tomatoes, basil and olive oil.',
          imageUrl: '',
          price: 14,
          priceLabel: '',
          priceOptions: [],
          addOns: [],
        },
      ],
    },
  ],
} as const satisfies TemplateOneMenuSample

const rootProps = (
  placePrimaryColor: string,
  source: string,
  wordmarkSrc = ''
) => ({
  placePrimaryColor,
  wordmarkSrc,
  source,
})

const consoleValues = [
  'Light and dark canvas',
  'Light and dark text',
  'Title colour',
  'Body and title font intent',
] as const

const defaultMenuPageStyle = {
  background_color_light: '#f8fafc',
  background_color_dark: '#0f172a',
  font_color_light: '#0f172a',
  font_color_dark: '#f8fafc',
  primary_color: '#0f766e',
  secondary_color: '#64748b',
  font_source: 'system',
  title_font_source: 'system',
} as const

const pizzaTheActionMenuPageStyle = {
  background_color_light: '#fff7d6',
  background_color_dark: '#102d20',
  font_color_light: '#345442',
  font_color_dark: '#fff8dc',
  title_color_light: '#123f2a',
  title_color_dark: '#fffbe8',
  primary_color: '#1f6b45',
  secondary_color: '#f2c94c',
  font_source: 'google',
  font_family: 'Inter',
  title_font_source: 'google',
  title_font_family: 'Montserrat',
} as const

export const landingTemplateBrands = [
  {
    id: 'seehotel-bonigen',
    name: 'Seehotel Bönigen',
    tier: 'root',
    demo: false,
    rootProps: rootProps(
      MISEBOX_BASIC_PRIMARY_COLOR,
      'Misebox Basic default primary colour'
    ),
  },
  {
    id: 'pizza-the-action',
    name: 'Pizza the Action',
    tier: 'console',
    demo: true,
    rootProps: rootProps(
      MISEBOX_BASIC_PRIMARY_COLOR,
      'Misebox Basic default primary colour'
    ),
    consoleProps: {
      source: 'Pizza the Action Demo Kitchen.menus.style',
      pageStyle: pizzaTheActionMenuPageStyle,
      values: consoleValues,
    },
  },
  {
    id: 'friiites',
    name: 'Friiites',
    tier: 'app',
    demo: false,
    rootProps: rootProps(
      '#0b0b0a',
      'Friiites Place primary colour',
      'http://localhost:3033/img/app/brand/wordmark-dark-transparent.png'
    ),
    consoleProps: {
      source: 'Effective default Menu PageStyle inherited by the App Kitchen',
      pageStyle: defaultMenuPageStyle,
      values: consoleValues,
    },
    appProps: {
      source: 'Friiites tenant App fixture',
      template: 'template-one',
      note: 'Real App consumer; template selection persistence remains to be modelled.',
      palette: { primary_color: '#d99a22', secondary_color: '#f3e9d2' },
      sceneOne: {
        present: 'wordmark',
        identityAlignment: 'left',
      },
      process: {
        eyebrow: 'Our method',
        title: 'Three steps. One proper fry.',
        description: '',
        steps: [
          {
            title: 'Hand-cut',
            body: 'Local potatoes are pressed through a manual potato cutter with their skins on.',
          },
          {
            title: 'Brined overnight',
            body: 'The cut potatoes rest in brine overnight.',
          },
          {
            title: 'Triple-fried',
            body: 'They are fried three times in beef tallow.',
          },
        ],
      },
    },
  },
  {
    id: 'deanos',
    name: "Deano's Smash",
    tier: 'app',
    demo: true,
    rootProps: rootProps(
      '#ff4f2e',
      "Deano's Demo Place primary colour",
      deanosWordmarkSrc
    ),
    consoleProps: {
      source: 'Effective default Menu PageStyle inherited by the Demo App Kitchen',
      pageStyle: defaultMenuPageStyle,
      values: consoleValues,
    },
    appProps: {
      source: "Deano's incremental App preview fixture",
      template: 'template-one',
      note: 'Demo App emulation; App presentation data can be extended incrementally.',
      palette: { primary_color: '#ff4f2e', secondary_color: '#f6ead8' },
      sceneOne: {
        present: 'wordmark',
        identityAlignment: 'center',
      },
      process: {
        eyebrow: 'The build',
        title: 'Smashed. Seared. Stacked.',
        description:
          'Neutral Demo copy proves that the same process anatomy can carry a different Kitchen identity.',
        steps: [
          {
            title: 'Smash',
            body: 'A fresh portion is pressed onto the hot grill.',
          },
          {
            title: 'Sear',
            body: 'Direct heat builds a deeply browned edge.',
          },
          {
            title: 'Stack',
            body: 'The finished layers are assembled and served hot.',
          },
        ],
      },
    },
  },
] as const satisfies readonly TemplateOneKitchenSpecimen[]

export const landingTemplates = [
  {
    slug: 'template-one',
    name: 'Template One',
    status: 'In development',
    summary: 'Place primary colour, Console theme, then App template.',
    anatomy: ['Page', 'Scenes', 'Layers', 'Elements'],
    features: ['Place primary colour', 'Console presentation', 'App template'],
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
): value is TemplateOneKitchenSpecimen['id'] =>
  landingTemplateBrands.some((brand) => brand.id === value)
