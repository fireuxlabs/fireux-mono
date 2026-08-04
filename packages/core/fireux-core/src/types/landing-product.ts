// Shared product-landing presentation contracts. Product truth stays with each App.
export type LandingProductAction = {
  label: string
  to: string
  icon?: string
}

export type LandingProductHero = {
  badge?: string
  kicker?: string
  title: string
  accent: string | readonly string[]
  description: string
  primaryAction: LandingProductAction
  secondaryAction: LandingProductAction
  quietAction?: LandingProductAction
  trustItems: readonly string[]
}

export type LandingProductProofCopy = {
  eyebrow: string
  title: string
  description?: string
  supporting?: string
  items?: readonly string[]
  action?: LandingProductAction
}

export type LandingProductCatalogueItem = {
  id: string
  title: string
  description: string
  icon?: string
  to: string
  action?: string
}

export type LandingProductCatalogueContent = {
  sectionId: string
  eyebrow: string
  title: string
  description?: string
  action?: LandingProductAction
  items: readonly LandingProductCatalogueItem[]
}

export type LandingProductEntryAction = Pick<
  LandingProductAction,
  'label' | 'to'
>

export type LandingProductEntryDoorway = {
  id: string
  title: string
  description: string
  action: LandingProductEntryAction
}

export type LandingProductEntryPathKind = 'start' | 'join'

export type LandingProductEntryPath<
  TKind extends LandingProductEntryPathKind = LandingProductEntryPathKind,
> = LandingProductEntryDoorway & {
  kind: TKind
}

export type LandingProductEntryContent = {
  sectionId: string
  eyebrow: string
  title: string
  description?: string
  paths: readonly [
    LandingProductEntryPath<'start'>,
    LandingProductEntryPath<'join'>,
  ]
  tool?: LandingProductEntryDoorway
}

export type LandingProductIndexContent = {
  hero: LandingProductHero
}

export type LandingPricingPlan = {
  id: string
  title: string
  description: string
  price: string
  billingCycle?: string
  features: readonly string[]
  to?: string
}

export type LandingOperationRailItem = {
  id: string
  title: string
  icon?: string
  to: string
}

export type LandingProductSurface = {
  id: string
  title: string
  description: string
  icon: string
  to: string
  action: string
  items?: readonly string[]
  supporting?: string
}

export type LandingConsolePreviewItem = {
  id: string
  title: string
  icon: string
}
