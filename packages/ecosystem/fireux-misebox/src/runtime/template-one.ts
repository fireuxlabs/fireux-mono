import type { BrandPalette } from 'fireux-core/runtime/models/utils/style.model'
import type { FireuxEntityManagement } from 'fireux-core/runtime/models/utils/scope.model'

export type { BrandPalette }

export type TemplateOneKitchenTier = FireuxEntityManagement['mode']

export type TemplateOneAtomProps = {
  rule: {
    label: string
  }
}

export type TemplateOneBrandInjection = {
  id: 'root-kitchen' | 'pizza-the-action' | 'friiites' | 'deanos'
  name: string
  tier: TemplateOneKitchenTier
  demo: boolean
  rootProps: { palette: BrandPalette; source: string }
  consoleProps?: { source: string; values: readonly string[] }
  appProps?: { source: string; template: 'template-one'; note: string }
  atoms: TemplateOneAtomProps
}
