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

export type TemplateOneKitchenSpecimen = {
  id: 'seehotel-bonigen' | 'pizza-the-action' | 'friiites' | 'deanos'
  name: string
  tier: TemplateOneKitchenTier
  demo: boolean
  assetSources: EntityAssetSourceMap
  rootProps: {
    placePrimaryColor: string
    wordmarkSrc: string
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
    }
    process: {
      eyebrow: string
      title: string
      description: string
      steps: readonly { title: string; body: string }[]
    }
  }
}
