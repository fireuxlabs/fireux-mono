import { type TemplateOneKitchenSpecimen } from '../models/template-one'
import {
  compactAppPalette,
  workspacePaletteFromApp,
} from 'fireux-core/runtime/utils/theme-palette'
import type { AppPalette } from 'fireux-core/types/theme'
export { createTemplateOneFixtureProjection } from '../utils/template-one-fixture-projection'

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

const friiitesWorkspacePalette = workspacePaletteFromApp(friiitesAppPalette)

export const landingTemplateBrands = [
  {
    id: 'friiites',
    name: 'Friiites',
    tier: 'app',
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
        display_family:
          "Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif",
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
    features: [
      'Four functional colours',
      'Typography intent',
      'Workspace surfaces',
    ],
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
    features: [
      'Place primary colour',
      'Workspace presentation',
      'App template',
    ],
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
