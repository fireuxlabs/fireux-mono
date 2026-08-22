import {
  projectTemplateOneKitchen,
  type TemplateOneFlagshipDish,
  type TemplateOneKitchenProjection,
  type TemplateOneKitchenSpecimen,
  type TemplateOneMenuContent,
} from './template-one'
import { MISEBOX_BASIC_PRIMARY_COLOR } from './kitchen-basic-presentation'
import {
  compactAppPalette,
  workspacePaletteFromApp,
} from 'fireux-core/runtime/utils/brand-palette'
import type { AppPalette } from 'fireux-core/types/theme'
import { resolveAppPalette } from 'fireux-core/runtime/utils/brand-palette'

const rootProps = (
  placePrimaryColor: string,
  source: string,
  wordmarkSrc = '',
  kitchenSource = '',
  tagline = ''
) => ({
  placePrimaryColor,
  wordmarkSrc,
  tagline,
  source,
  ...(kitchenSource ? { kitchenSource } : {}),
})

const workspaceValues = [
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

const friiitesWorkspacePalette = workspacePaletteFromApp(friiitesAppPalette)
const deanosWorkspacePalette = workspacePaletteFromApp(deanosAppPalette)

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
    tier: 'workspace',
    demo: true,
    assetSources: {
      logo: 'demo:kitchens/pizza-the-action/logo.png',
    },
    rootProps: rootProps(
      MISEBOX_BASIC_PRIMARY_COLOR,
      'Misebox Basic default primary colour',
      '',
      '',
      'Pizza, pasta and neighbourhood hospitality.'
    ),
    workspaceProps: {
      source: 'Pizza the Action Demo Kitchen.menus.style',
      pageStyle: pizzaTheActionMenuPageStyle,
      palette: {
        canvas: '#fff7d6', text: '#345442', accent: '#1f6b45', accent_contrast: '#fff8dc',
      },
      values: workspaceValues,
    },
  },
  {
    id: 'friiites',
    name: 'Friiites',
    tier: 'app',
    demo: false,
    assetSources: {
      logo: 'apps/friiites/img/app/logo.png',
      wordmarkLight: 'apps/friiites/img/app/wordmark-light.png',
      wordmarkDark: 'apps/friiites/img/app/wordmark-dark.png',
      cover: 'apps/friiites/img/app/cover.png',
      thumbnail: 'apps/friiites/img/app/thumbnail.png',
    },
    rootProps: rootProps(
      '#0b0b0a',
      'places/5dGJgdjDv7Zi0tjva61O · media_backdrop_color',
      'https://firebasestorage.googleapis.com/v0/b/misebox-78f9c.appspot.com/o/apps%2Ffriiites%2Fimg%2Fapp%2Fwordmark-dark.png?alt=media',
      'kitchens/5dGJgdjDv7Zi0tjva61O · assets.backdrop_color',
      'Hand-cut. Brined. Triple-fried in beef tallow.'
    ),
    workspaceProps: {
      source: 'kitchens/5dGJgdjDv7Zi0tjva61O · theme.palette',
      pageStyle: defaultMenuPageStyle,
      palette: friiitesWorkspacePalette,
      values: workspaceValues,
    },
    appProps: {
      source: 'apps/friiites · theme.palette',
      appId: 'friiites',
      kitchenId: '5dGJgdjDv7Zi0tjva61O',
      template: 'template-one',
      note: 'Real App consumer; template selection persistence remains to be modelled.',
      palette: compactAppPalette(friiitesAppPalette, friiitesWorkspacePalette),
      typography: {
        display_family: "Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif",
        body_family: "'Arial Narrow', Arial, sans-serif",
      },
      sceneOne: {
        present: 'wordmark',
        identityAlignment: 'left',
        tagline: ['Hand-cut.', 'Brined.', 'Triple-fried', 'in beef tallow.'],
        productCrop: {
          visibleAspect: 857 / 445,
          scale: 1200 / 857,
          offsetX: -(178 / 857) * 100,
          offsetY: -(387 / 445) * 100,
        },
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
      'demo:apps/deanos/img/app/wordmark-dark.png',
      '',
      'Smashed. Seared. Stacked. Served hot.'
    ),
    workspaceProps: {
      source: "Deano's Demo Workspace palette derived from its App",
      pageStyle: defaultMenuPageStyle,
      palette: deanosWorkspacePalette,
      values: workspaceValues,
    },
    appProps: {
      source: "Deano's incremental App preview fixture",
      appId: 'deanos',
      kitchenId: 'deanos',
      template: 'template-one',
      note: 'Demo App emulation; App presentation data can be extended incrementally.',
      palette: compactAppPalette(deanosAppPalette, deanosWorkspacePalette),
      typography: {
        display_family: 'Montserrat, Arial, sans-serif',
        body_family: 'Inter, Arial, sans-serif',
      },
      sceneOne: {
        present: 'wordmark',
        identityAlignment: 'center',
        tagline: ['Smashed.', 'Seared.', 'Stacked.', 'Served hot.'],
        productCrop: {
          visibleAspect: 1.6,
          scale: 1,
          offsetX: 0,
          offsetY: 0,
        },
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
    minimumTier: 'workspace',
    status: 'Workspace',
    summary: 'Functional Workspace presentation extending the Default level.',
    anatomy: ['Default presentation', 'Workspace palette', 'PageStyle'],
    features: ['Four functional colours', 'Typography intent', 'Workspace surfaces'],
    purchaseOptions: [],
    brands: landingTemplateBrands,
  },
  {
    slug: 'template-one',
    name: 'Template One',
    kind: 'template',
    minimumTier: 'app',
    status: 'In development',
    summary: 'Place primary colour, Workspace theme, then App template.',
    anatomy: ['Page', 'Scenes', 'Layers', 'Elements'],
    features: ['Place primary colour', 'Workspace presentation', 'App template'],
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
  const palette = resolveAppPalette(kitchen.workspaceProps.palette, kitchen.appProps.palette)
  if (!palette)
    throw new Error(`${kitchen.name} has no effective Template One palette`)
  const isFriiites = kitchen.id === 'friiites'
  const asset = (friiites: string, deanos: string) => media(isFriiites ? friiites : deanos)
  return projectTemplateOneKitchen({
    id: kitchen.id,
    name: kitchen.name,
    placePrimaryColor: kitchen.rootProps.placePrimaryColor,
    wordmarkSrc: input.wordmarkSrc || media(isFriiites ? 'wordmark-dark.png' : 'wordmark-dark.png'),
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
        { label: 'Counter', icon: 'i-lucide-chef-hat', description: 'Order with the team at the counter.', action: 'Staff sign in', to: isFriiites ? '/auth?redirect=/friiites.staff_pos' : '#menu' },
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
