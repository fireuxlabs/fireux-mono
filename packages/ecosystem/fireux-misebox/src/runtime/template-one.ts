import type { BrandPalette } from 'fireux-core/runtime/models/utils/style.model'
import type { PageStyle } from 'fireux-core/runtime/models/utils/style.model'
import type { FireuxEntityManagement } from 'fireux-core/runtime/models/utils/scope.model'
import type { MenuManifestSection } from 'fireux-kitchens/runtime/models/kitchen/menu/menu-detail.model'

export type { BrandPalette }

export type TemplateOneKitchenTier = FireuxEntityManagement['mode']

export type TemplateOneMenuSample = {
  sections: MenuManifestSection[]
}

export type TemplateOneKitchenSpecimen = {
  id: 'seehotel-bonigen' | 'pizza-the-action' | 'friiites' | 'deanos'
  name: string
  tier: TemplateOneKitchenTier
  demo: boolean
  rootProps: {
    placePrimaryColor: string
    wordmarkSrc: string
    source: string
  }
  consoleProps?: {
    source: string
    pageStyle: Partial<PageStyle>
    values: readonly string[]
  }
  appProps?: {
    source: string
    template: 'template-one'
    note: string
    palette: BrandPalette
    sceneOne: {
      present: 'wordmark'
      identityAlignment: 'left' | 'center'
    }
    process: {
      eyebrow: string
      title: string
      description: string
      steps: readonly { title: string; body: string }[]
    }
  }
}
