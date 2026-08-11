import type { BrandPalette } from 'fireux-core/runtime/models/utils/style.model'

export type { BrandPalette }

export type TemplateOneKitchenTier = 'basic' | 'console' | 'app'

export type TemplateOneAtomProps = {
  rule: {
    label: string
  }
}

export type TemplateOneBrandInjection = {
  id: 'basic-kitchen' | 'pizza-the-action' | 'friiites' | 'deanos'
  name: string
  tier: TemplateOneKitchenTier
  demo: boolean
  basicProps: { palette: BrandPalette; source: string }
  consoleProps?: { source: string; values: readonly string[] }
  appProps?: { source: string; template: 'template-one'; note: string }
  atoms: TemplateOneAtomProps
}
