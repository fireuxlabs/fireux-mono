export type LandingTemplateBrandId =
  | 'friiites'
  | 'deanos'
  | 'misebox-restaurant'

export type LandingTemplateAsset = {
  src: string
  alt: string
  width: number
  height: number
  source: string
}

export type LandingTemplateBrand = {
  id: LandingTemplateBrandId
  name: string
  eyebrow: string
  headline: string
  description: string
  primaryAction: { label: string; to: string }
  secondaryAction: { label: string; to: string }
  proof: readonly [string, string, string]
  palette: {
    canvas: string
    surface: string
    ink: string
    muted: string
    accent: string
    accentInk: string
  }
  type: { display: string; body: string; transform: 'none' | 'uppercase' }
  wordmark?: LandingTemplateAsset
  heroMedia?: LandingTemplateAsset
  assetNote: string
}

export type LandingTemplateDefinition = {
  slug: 'scene-one'
  name: string
  summary: string
  status: 'Proven'
  anatomy: readonly string[]
  features: readonly string[]
  purchaseOptions: readonly {
    seller: 'FireUX' | 'Misebox'
    label: string
    to: string
  }[]
  brands: readonly LandingTemplateBrand[]
}
