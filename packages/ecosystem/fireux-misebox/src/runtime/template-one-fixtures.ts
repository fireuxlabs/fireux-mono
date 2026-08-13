import type { TemplateOneKitchenSpecimen } from './template-one'
import type { TemplateOneMenuSample } from './template-one'
import { MISEBOX_BASIC_PRIMARY_COLOR } from './kitchen-basic-presentation'
import {
  compactAppPalette,
  consolePaletteFromApp,
} from 'fireux-core/runtime/utils/brand-palette'
import type { AppPalette } from 'fireux-core/types/theme'

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
  wordmarkSrc = '',
  kitchenSource = ''
) => ({
  placePrimaryColor,
  wordmarkSrc,
  source,
  ...(kitchenSource ? { kitchenSource } : {}),
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

const friiitesAppPalette = {
  canvas: '#181817',
  surface: '#242321',
  canvas_inverted: '#f3e9d2',
  text: '#f3e9d2',
  text_muted: '#bdb6a5',
  ink: '#181817',
  accent: '#d99a22',
  accent_contrast: '#181817',
} as const satisfies AppPalette

const deanosAppPalette = {
  canvas: '#0b0b0a',
  surface: '#211916',
  canvas_inverted: '#f6ead8',
  text: '#f6ead8',
  text_muted: '#c7b6aa',
  ink: '#0b0b0a',
  accent: '#ff4f2e',
  accent_contrast: '#0b0b0a',
} as const satisfies AppPalette

const friiitesConsolePalette = consolePaletteFromApp(friiitesAppPalette)
const deanosConsolePalette = consolePaletteFromApp(deanosAppPalette)

export const landingTemplateBrands = [
  {
    id: 'seehotel-bonigen',
    name: 'Seehotel Bönigen',
    tier: 'root',
    demo: false,
    assetSources: {},
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
    assetSources: {
      logo: 'demo:kitchens/pizza-the-action/logo.png',
    },
    rootProps: rootProps(
      MISEBOX_BASIC_PRIMARY_COLOR,
      'Misebox Basic default primary colour'
    ),
    consoleProps: {
      source: 'Pizza the Action Demo Kitchen.menus.style',
      pageStyle: pizzaTheActionMenuPageStyle,
      palette: {
        canvas: '#fff7d6', text: '#345442', accent: '#1f6b45', accent_contrast: '#fff8dc',
      },
      values: consoleValues,
    },
  },
  {
    id: 'friiites',
    name: 'Friiites',
    tier: 'app',
    demo: false,
    assetSources: {},
    rootProps: rootProps(
      '#0b0b0a',
      'places/5dGJgdjDv7Zi0tjva61O · media_backdrop_color',
      '',
      'kitchens/5dGJgdjDv7Zi0tjva61O · assets.backdrop_color'
    ),
    consoleProps: {
      source: 'apps/friiites/kitchens/5dGJgdjDv7Zi0tjva61O · console.theme.palette',
      pageStyle: defaultMenuPageStyle,
      palette: friiitesConsolePalette,
      values: consoleValues,
    },
    appProps: {
      source: 'apps/friiites · theme.palette',
      appId: 'friiites',
      kitchenId: '5dGJgdjDv7Zi0tjva61O',
      template: 'template-one',
      note: 'Real App consumer; template selection persistence remains to be modelled.',
      palette: compactAppPalette(friiitesAppPalette, friiitesConsolePalette),
      typography: {
        display_family: "Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif",
        body_family: "'Arial Narrow', Arial, sans-serif",
      },
      sceneOne: {
        present: 'wordmark',
        identityAlignment: 'left',
        tagline: ['Hand-cut.', 'Brined.', 'Triple-fried', 'in beef tallow.'],
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
    assetSources: {
      logo: 'demo:apps/deanos/img/app/logo.png',
      wordmarkLight: 'demo:apps/deanos/img/app/wordmark-light.png',
      wordmarkDark: 'demo:apps/deanos/img/app/wordmark-dark.png',
      cover: 'demo:apps/deanos/img/app/cover.png',
      thumbnail: 'demo:apps/deanos/img/app/thumbnail.png',
    },
    rootProps: rootProps(
      '#ff4f2e',
      "Deano's Demo Place primary colour",
      'demo:apps/deanos/img/app/wordmark-dark.png'
    ),
    consoleProps: {
      source: "Deano's Demo Console palette derived from its App",
      pageStyle: defaultMenuPageStyle,
      palette: deanosConsolePalette,
      values: consoleValues,
    },
    appProps: {
      source: "Deano's incremental App preview fixture",
      appId: 'deanos',
      kitchenId: 'deanos',
      template: 'template-one',
      note: 'Demo App emulation; App presentation data can be extended incrementally.',
      palette: compactAppPalette(deanosAppPalette, deanosConsolePalette),
      typography: {
        display_family: 'Montserrat, Arial, sans-serif',
        body_family: 'Inter, Arial, sans-serif',
      },
      sceneOne: {
        present: 'wordmark',
        identityAlignment: 'center',
        tagline: ['Smashed.', 'Seared.', 'Stacked.', 'Served hot.'],
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
    slug: 'default',
    name: 'Default',
    kind: 'default',
    minimumTier: 'root',
    status: 'Included',
    summary: 'Out-of-box Kitchen presentation using inherited Place identity.',
    anatomy: ['Place identity', 'Kitchen doorway', 'Menu baseline'],
    features: ['Identity backdrop', 'Kitchen identity', 'Default Menu'],
    purchaseOptions: [],
    brands: landingTemplateBrands,
  },
  {
    slug: 'theme',
    name: 'Theme',
    kind: 'theme',
    minimumTier: 'console',
    status: 'Console',
    summary: 'Functional Console presentation extending the Default level.',
    anatomy: ['Default presentation', 'Console palette', 'PageStyle'],
    features: ['Four functional colours', 'Typography intent', 'Console surfaces'],
    purchaseOptions: [],
    brands: landingTemplateBrands,
  },
  {
    slug: 'template-one',
    name: 'Template One',
    kind: 'template',
    minimumTier: 'app',
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
  {
    slug: 'template-two',
    name: 'Template Two',
    kind: 'template',
    minimumTier: 'app',
    status: 'Foundation only',
    summary: 'The same Kitchen inputs, ready for a second composition.',
    anatomy: ['Page', 'Scenes', 'Layers', 'Elements'],
    features: ['Shared Kitchen projection', 'Independent template anatomy'],
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
