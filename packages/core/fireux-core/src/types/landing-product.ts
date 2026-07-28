// Shared product-landing presentation contracts. Product truth stays with each App.
export type LandingProductAction = {
  label: string
  to: string
  icon?: string
}

export type LandingProductHero = {
  badge: string
  kicker: string
  title: string
  accent: string
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

export type LandingProductIndexContent = {
  hero: LandingProductHero
  onboardingLabel?: string
}
