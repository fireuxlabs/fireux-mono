import type { Professional } from 'fireux-jobs/runtime/models/profiles/Professional/Professional.model'

export type DemoSeoProviderEntityType = 'professional'
export type DemoSeoProviderType = 'consultant' | 'agency'
export type DemoSeoLeadStatus = 'new' | 'contacted' | 'closed'

export type DemoSeoTestimonial = {
  quote: string
  name?: string
  company?: string
}

export type DemoSeoProfessionalProfile = Pick<
  Professional,
  'id' | 'title' | 'subtitle' | 'tagline' | 'summary' | 'bio' | 'image' | 'positions' | 'tags'
>

export type DemoSeoProfessionalCollectionEntry = Professional & {
  to: string
  user: {
    id: string
    display_name: string
    avatar: string
    handle: string
  }
  seoProvider: DemoSeoProvider
}

export type DemoSeoProviderBase = {
  id: string
  userId: string
  entityType: DemoSeoProviderEntityType
  providerType: DemoSeoProviderType
  slug: string
  brandName?: string
  logoUrl?: string
  headline: string
  summary: string
  bio: string
  locationLabel: string
  remoteAvailable: boolean
  yearsExperience?: number
  teamSizeLabel?: string
  sectorExperience: string[]
  specialisms: string[]
  servicesOffered: string[]
  projectTypes: string[]
  pricingGuidance: string
  availabilityStatus: string
  rating: number
  reviewCount: number
  contactEmail?: string
  isVerified: boolean
  isFeatured: boolean
  source: 'demo'
  isDemo: boolean
  trustNote?: string
  testimonials: DemoSeoTestimonial[]
  proofHighlights: string[]
  featuredCaseStudyIds: string[]
}

export type DemoSeoProfessionalProvider = DemoSeoProviderBase & {
  entityType: 'professional'
  professionalId: string
  displayName: string
  avatarUrl: string
  user: {
    id: string
    display_name: string
    avatar: string
    handle: string
    email: string
  }
  professional: DemoSeoProfessionalProfile
}

export type DemoSeoProvider = DemoSeoProfessionalProvider
export type DemoSeoProviderSeed = DemoSeoProviderBase

export type DemoSeoCaseStudy = {
  id: string
  ownerEntityType: DemoSeoProviderEntityType
  ownerEntityId: string
  slug: string
  status: 'draft' | 'published'
  title: string
  clientLabel: string
  clientType: string
  sector: string
  problem: string
  actions: string[]
  resultsSummary: string
  metrics: { label: string; value: string }[]
  timeframeLabel: string
  isFeatured: boolean
}

export type DemoSeoLeadInquiry = {
  id: string
  providerEntityType: DemoSeoProviderEntityType
  providerEntityId: string
  providerSlug: string
  providerDisplayName: string
  status: DemoSeoLeadStatus
  contactName: string
  contactEmail: string
  companyName: string
  websiteUrl?: string
  sector?: string
  projectSummary: string
  budgetRange: string
  timeline: string
  consentContact: boolean
  createdAt: string
}

export type DemoSeoLeadDraft = {
  contactName: string
  contactEmail: string
  companyName: string
  websiteUrl?: string
  sector?: string
  projectSummary: string
  budgetRange: string
  timeline: string
  consentContact: boolean
}
