import type { BrandPalette } from 'fireux-core/runtime/models/utils/style.model'
import type {
  AppPalette,
  AppPaletteLayer,
  ConsolePalette,
} from 'fireux-core/runtime/models/utils/style.model'
import type { PageStyle } from 'fireux-core/runtime/models/utils/style.model'
import type { FireuxEntityManagement } from 'fireux-core/runtime/models/utils/scope.model'
import type { EntityAssetSourceMap } from 'fireux-core/runtime/models/operations/entity-asset-onboarding'
import type { AppTypography } from 'fireux-core/types/theme'
import type {
  MenuManifestContent,
  MenuManifestItem,
} from 'fireux-kitchens/runtime/models/kitchen/menu/menu-detail.model'

export type { AppPalette, AppPaletteLayer, AppTypography, BrandPalette, ConsolePalette }

export type TemplateOneKitchenTier = FireuxEntityManagement['mode']

export const templateOneOrderingCopy = {
  navigationLabel: 'Ordering',
  eyebrow: 'Five ways to order',
  title: 'Ordering',
  description: 'Choose the service that fits where you are and what you need.',
} as const

export type TemplateOneFlagshipDish = {
  id: string
  name: string
  description: string
  image: string
}

export type TemplateOneSceneOneRequirements = {
  wordmark: boolean
  palette: boolean
  typography: boolean
  flagshipDish: boolean
  pattern: 'approved' | 'unapproved' | 'missing'
}

export type TemplateOneMenuContent = {
  menu: MenuManifestContent
  specials?: MenuManifestContent | null
  makeItYours?: MenuManifestItem | null
  menuHref?: string
  menuActionLabel?: string
}

export type TemplateOneLink = {
  label: string
  to: string
  description?: string
  action?: string
  icon?: string
}

export type TemplateOneMedia = {
  src: string
  alt: string
}

export type TemplateOneKitchenProjection = {
  id: string
  name: string
  placePrimaryColor: string
  wordmarkSrc: string
  palette: AppPalette
  typography: AppTypography
  flagshipDish: TemplateOneFlagshipDish | null
  requirements: TemplateOneSceneOneRequirements
  hero: {
    identityAlignment: 'left' | 'center'
    tagline: readonly string[]
    productCrop?: { visibleAspect: number; scale: number; offsetX: number; offsetY: number }
  }
  menu: TemplateOneMenuContent
  ordering: {
    artifacts: readonly TemplateOneMedia[]
    surfaces: readonly TemplateOneLink[]
  }
  franchise: {
    title: string
    description: string
    actionLabel: string
    media: readonly TemplateOneMedia[]
  }
  provider: {
    title: string
    description: string
    href: string
    wordmarkLightSrc: string
    wordmarkDarkSrc: string
    name: string
  }
  footer: {
    eyebrow: string
    title: string
    description: string
    consoleTo: string
    consoleLabel: string
    origin: string
    links: readonly TemplateOneLink[]
  }
}

export type TemplateOneKitchenProjectionInput = Omit<
  TemplateOneKitchenProjection,
  'requirements'
> & { requirements?: Partial<TemplateOneSceneOneRequirements> }

export const projectTemplateOneKitchen = (
  input: TemplateOneKitchenProjectionInput
): TemplateOneKitchenProjection => ({
  ...input,
  requirements: {
    wordmark: Boolean(input.wordmarkSrc),
    palette: Boolean(input.palette),
    typography: Boolean(input.typography.display_family && input.typography.body_family),
    flagshipDish: Boolean(input.flagshipDish?.image),
    pattern: 'unapproved',
    ...input.requirements,
  },
})

export type TemplateOneKitchenSpecimen = {
  id: 'seehotel-bonigen' | 'pizza-the-action' | 'friiites' | 'deanos'
  name: string
  tier: TemplateOneKitchenTier
  demo: boolean
  assetSources: EntityAssetSourceMap
  rootProps: {
    placePrimaryColor: string
    wordmarkSrc: string
    tagline: string
    source: string
    kitchenSource?: string
  }
  consoleProps?: {
    source: string
    pageStyle: Partial<PageStyle>
    palette: ConsolePalette
    values: readonly string[]
  }
  appProps?: {
    source: string
    template: 'template-one'
    note: string
    palette: AppPaletteLayer
    typography: AppTypography
    kitchenId: string
    appId: string
    patternSrc?: string
    sceneOne: {
      present: 'wordmark'
      identityAlignment: 'left' | 'center'
      tagline: readonly string[]
      productCrop?: {
        visibleAspect: number
        scale: number
        offsetX: number
        offsetY: number
      }
    }
    process: {
      eyebrow: string
      title: string
      description: string
      steps: readonly { title: string; body: string }[]
    }
  }
}
