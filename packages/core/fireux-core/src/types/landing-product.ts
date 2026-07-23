// Concurrent edit — 2026-07-23 02:43 CEST — Central landing product family: define the shared content contract.
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

export type LandingProductLoopStep = {
  title: string
  copy: string
  icon: string
  to: string
}

export type LandingProductArea = {
  eyebrow: string
  title: string
  copy: string
  items: readonly string[]
  icon: string
  to: string
  action: string
  accent?: string
}

export type LandingProductExperience = {
  eyebrow: string
  title: string
  copy: string
  icon: string
  to: string
}

export type LandingProductOperation = {
  id: string
  title: string
  description: string
  icon?: string
  to: string
}

export type LandingProductAudience = {
  title: string
  copy: string
  action: string
  to: string
  icon: string
}

export type LandingProductIndexContent = {
  hero: LandingProductHero
  operatingLoop: readonly LandingProductLoopStep[]
  system: {
    eyebrow: string
    title: string
    description: string
    areas: readonly LandingProductArea[]
  }
  showcase: {
    badge: string
    eyebrow: string
    title: string
    description: string
    action: LandingProductAction
    experiences: readonly LandingProductExperience[]
  }
  operations: {
    eyebrow: string
    title: string
    description: string
    action: LandingProductAction
    items: readonly LandingProductOperation[]
  }
  audiences: {
    eyebrow: string
    title: string
    items: readonly LandingProductAudience[]
  }
  finalCta: {
    eyebrow: string
    title: string
    description: string
    primaryAction: LandingProductAction
    secondaryAction: LandingProductAction
  }
}
