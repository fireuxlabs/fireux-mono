import type {
  LandingTemplateBrand,
  LandingTemplateBrandId,
  LandingTemplateDefinition,
} from '../types/landing-template'

const demoMedia = (path: string) =>
  `https://firebasestorage.googleapis.com/v0/b/misebox-78f9c.appspot.com/o/${encodeURIComponent(`demo/misebox-app/${path}`)}?alt=media&token=f71ae1d8-4b0e-4d0c-8b65-cc99580a6c60`

const friiitesWordmark =
  'data:image/svg+xml;charset=utf-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1600" height="500" viewBox="0 0 1600 500"%3E%3Cg font-family="Arial Narrow,Helvetica Neue,Arial,sans-serif" font-weight="700" font-size="220" letter-spacing="4"%3E%3Ctext x="280" y="325" fill="%23F3E9D2"%3EFR%3C/text%3E%3C/g%3E%3Cg fill="%23D99A22"%3E%3Crect x="600" y="140" width="54" height="220" rx="4"/%3E%3Crect x="690" y="140" width="54" height="220" rx="4"/%3E%3Crect x="780" y="140" width="54" height="220" rx="4"/%3E%3C/g%3E%3Cg font-family="Arial Narrow,Helvetica Neue,Arial,sans-serif" font-weight="700" font-size="220" letter-spacing="4"%3E%3Ctext x="880" y="325" fill="%23F3E9D2"%3ETES%3C/text%3E%3C/g%3E%3C/svg%3E'

export const landingTemplateBrands = [
  {
    id: 'friiites',
    name: 'Friiites',
    eyebrow: 'Fries · Switzerland',
    headline: 'Hand-cut. Brined. Triple-fried in beef tallow.',
    description:
      'A focused restaurant landing built around the product and its repeatable kitchen method.',
    primaryAction: { label: 'Order now', to: '#proof' },
    secondaryAction: { label: 'Our method', to: '#story' },
    proof: ['Hand-cut potatoes', 'Brined before frying', 'Three-stage fry'],
    palette: {
      canvas: '#0b0b0a',
      surface: '#171714',
      ink: '#f3e9d2',
      muted: '#bdb39d',
      accent: '#d99a22',
      accentInk: '#0b0b0a',
    },
    type: {
      display: "Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif",
      body: 'Arial, sans-serif',
      transform: 'uppercase',
    },
    wordmark: {
      src: friiitesWordmark,
      alt: 'Friiites',
      width: 1600,
      height: 500,
      source:
        'projects/misebox/friiites/public/img/app/brand/logo-wordmark-master.svg',
    },
    assetNote:
      'Uses the current Friiites master wordmark. Product photography remains absent until an approved reusable preview crop exists.',
  },
  {
    id: 'deanos',
    name: 'Deanos Smash Burger',
    eyebrow: 'Burgers · Bern',
    headline: 'Smashed to order. Served fast.',
    description:
      'The same composition shifts to a high-energy takeaway identity using the Misebox Demo Kitchen’s owned menu media.',
    primaryAction: { label: 'View the menu', to: '#proof' },
    secondaryAction: { label: 'How we cook', to: '#story' },
    proof: [
      'Smashed beef',
      'Collection and takeaway',
      'Open daily 11:30–22:00',
    ],
    palette: {
      canvas: '#f5f1e8',
      surface: '#ff4f2e',
      ink: '#181817',
      muted: '#665f55',
      accent: '#ff4f2e',
      accentInk: '#181817',
    },
    type: {
      display: "'Arial Black', 'Space Grotesk', sans-serif",
      body: 'Inter, Arial, sans-serif',
      transform: 'uppercase',
    },
    heroMedia: {
      src: demoMedia('kitchens/deanos/menu/double-trouble.jpg'),
      alt: 'A double smash burger from the Deanos Demo Kitchen',
      width: 1600,
      height: 1000,
      source: 'Misebox Demo media · kitchens/deanos/menu/double-trouble.jpg',
    },
    assetNote:
      'No separate canonical Deanos wordmark is declared. The preview uses its source name as an honest typographic fallback.',
  },
  {
    id: 'misebox-restaurant',
    name: 'Misebox Restaurant',
    eyebrow: 'Seasonal dining · Zurich',
    headline: 'Seasonal plates in a relaxed garden dining room.',
    description:
      'A quieter editorial injection proves the anatomy can carry a full-service restaurant without changing its scene markup.',
    primaryAction: { label: 'Explore the menu', to: '#proof' },
    secondaryAction: { label: 'Our kitchen', to: '#story' },
    proof: ['Seasonal Menu', 'Eat in or takeaway', 'Twelve-table dining room'],
    palette: {
      canvas: '#eee7da',
      surface: '#183328',
      ink: '#183328',
      muted: '#667269',
      accent: '#b77a4b',
      accentInk: '#fffaf1',
    },
    type: {
      display: "'Cormorant Garamond', Georgia, serif",
      body: 'Lora, Georgia, serif',
      transform: 'none',
    },
    heroMedia: {
      src: demoMedia(
        'kitchens/misebox-restaurant/menu/charred-mushroom-flatbread.jpg'
      ),
      alt: 'Charred mushroom flatbread from the Misebox Restaurant Demo Kitchen',
      width: 1600,
      height: 1000,
      source:
        'Misebox Demo media · kitchens/misebox-restaurant/menu/charred-mushroom-flatbread.jpg',
    },
    assetNote:
      'No separate restaurant wordmark is declared. The preview uses its source name and owned Demo Kitchen media.',
  },
] as const satisfies readonly LandingTemplateBrand[]

export const landingTemplates = [
  {
    slug: 'scene-one',
    name: 'Scene One',
    summary:
      'A cinematic hospitality landing with a disciplined hero, product proof, story beat and closing action.',
    status: 'Proven',
    anatomy: ['Page', 'Scenes', 'Layers', 'Elements'],
    features: [
      'One shared scene anatomy',
      'Typed brand tokens and content',
      'Desktop and phone preview',
      'Honest missing-asset fallbacks',
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
        to: 'https://misebox.app/templates',
      },
    ],
    brands: landingTemplateBrands,
  },
] as const satisfies readonly LandingTemplateDefinition[]

export const findLandingTemplate = (slug: string) =>
  landingTemplates.find((template) => template.slug === slug)

export const findLandingTemplateBrand = (id: string) =>
  landingTemplateBrands.find((brand) => brand.id === id)

export const isLandingTemplateBrandId = (
  value: string
): value is LandingTemplateBrandId =>
  landingTemplateBrands.some((brand) => brand.id === value)
