// App-owned local simulation payloads for Find My SEO.
// These records power the explicit preflight preview and are never canonical storage.
// Professional identity fields intentionally mirror fireux-jobs Professional.
// Concurrent edit — 2026-07-20 11:44 CEST — Root Efficiency Pass 4 of 4: move Find My SEO fixtures to their app owner.
// Concurrent edit — 2026-07-20 17:03 CEST — Demo Data Spine pass: make the preview self-contained and remove delivery claims.

import type { Professional } from 'fireux-jobs/runtime/utils/profiles/Professional/professional'
import { demoSeoCaseStudyList } from './findMySeo.case-studies'
import { demoSeoAgencySeeds } from './findMySeo.provider-agencies'
import { demoSeoConsultantSeeds } from './findMySeo.provider-consultants'
import type {
  DemoSeoLeadInquiry,
  DemoSeoProfessionalCollectionEntry,
  DemoSeoProfessionalProfile,
  DemoSeoProvider,
  DemoSeoProviderSeed,
} from './findMySeo.types'

export type {
  DemoSeoProviderEntityType,
  DemoSeoProviderType,
  DemoSeoLeadStatus,
  DemoSeoTestimonial,
  DemoSeoProfessionalProfile,
  DemoSeoProfessionalCollectionEntry,
  DemoSeoProviderBase,
  DemoSeoProfessionalProvider,
  DemoSeoProvider,
  DemoSeoProviderSeed,
  DemoSeoCaseStudy,
  DemoSeoLeadInquiry,
  DemoSeoLeadDraft,
} from './findMySeo.types'
export { demoSeoCaseStudyList }

type SimulationPersona = {
  id: string
  display_name: string
  handle: string
  avatar: string
}

const simulationPersona = (id: string, displayName: string, handle: string): SimulationPersona => ({
  id,
  display_name: displayName,
  handle,
  avatar: `https://api.dicebear.com/9.x/personas/svg?seed=${encodeURIComponent(`find-my-seo-${handle}`)}`,
})

const demoUsersById = new Map<string, SimulationPersona>([
  simulationPersona('demo-user-seo-alex', 'Alex Mercer', 'alex-mercer'),
  simulationPersona('demo-user-seo-nina', 'Nina Shaw', 'nina-shaw'),
  simulationPersona('demo-user-seo-sera', 'Sera James', 'sera-james'),
  simulationPersona('demo-user-seo-imogen', 'Imogen Ward', 'imogen-ward'),
  simulationPersona('demo-user-seo-maya', 'Maya Reeves', 'maya-reeves'),
  simulationPersona('demo-user-seo-omar', 'Omar Haddad', 'omar-haddad'),
  simulationPersona('demo-user-seo-ella', 'Ella Priest', 'ella-priest'),
  simulationPersona('demo-user-seo-josh', 'Josh Tan', 'josh-tan'),
  simulationPersona('demo-user-seo-priya', 'Priya Narayan', 'priya-narayan'),
  simulationPersona('demo-user-seo-leon', 'Leon Keller', 'leon-keller'),
].map((user) => [user.id, user]))

const requireDemoUser = (userId: string) => {
  const user = demoUsersById.get(userId)
  if (!user) {
    throw new Error(`[find-my-seo.demo] Missing shared demo user: ${userId}`)
  }
  return user
}

const resolveDemoSeoProviderLabel = (provider: Pick<DemoSeoProvider, 'providerType'>) =>
  provider.providerType === 'agency' ? 'Agency' : 'Consultant'

const toDemoProfessionalProfile = (
  provider: DemoSeoProviderSeed,
  user: ReturnType<typeof requireDemoUser>
): DemoSeoProfessionalProfile => ({
  id: provider.id,
  title: provider.headline,
  subtitle: provider.locationLabel,
  tagline: provider.pricingGuidance,
  summary: provider.summary,
  bio: provider.bio,
  image: user.avatar || provider.logoUrl || '',
  positions: provider.specialisms,
  tags: [...provider.specialisms, ...provider.sectorExperience],
})

const toDemoSeoProvider = (provider: DemoSeoProviderSeed): DemoSeoProvider => {
  const user = requireDemoUser(provider.userId)
  const contactEmail = provider.contactEmail ?? ''

  return {
    ...provider,
    entityType: 'professional',
    professionalId: provider.id,
    displayName: user.display_name,
    avatarUrl: user.avatar,
    contactEmail,
    user: {
      id: user.id,
      display_name: user.display_name,
      avatar: user.avatar,
      handle: user.handle,
      email: contactEmail,
    },
    professional: toDemoProfessionalProfile(provider, user),
  }
}

const demoStamp = {
  at: {} as Professional['created']['at'],
  by: undefined,
}

const toDemoSeoProfessionalEntry = (
  provider: DemoSeoProvider
): DemoSeoProfessionalCollectionEntry => ({
  id: provider.id,
  to: `/professionals/${provider.slug}`,
  title: provider.headline,
  subtitle: provider.locationLabel,
  tagline: provider.pricingGuidance,
  summary: provider.summary,
  bio: provider.bio,
  image: provider.avatarUrl || provider.logoUrl || '',
  positions: provider.specialisms,
  tags: [
    resolveDemoSeoProviderLabel(provider),
    ...(provider.isFeatured ? ['Featured'] : []),
    ...(provider.isVerified ? ['Verified'] : []),
    ...provider.specialisms.slice(0, 2),
  ],
  relevant_experience: [],
  other_experience: [],
  languages: [],
  certifications: [],
  education: [],
  volunteering: [],
  projects: [],
  created: demoStamp,
  updated: demoStamp,
  user: {
    id: provider.user.id,
    display_name: provider.user.display_name,
    avatar: provider.user.avatar,
    handle: provider.user.handle,
  },
  seoProvider: provider,
})

const demoSeoProviderSeedById = new Map(
  [
  ...demoSeoConsultantSeeds,
  ...demoSeoAgencySeeds,
  ].map(seed => [seed.id, seed])
)
const demoSeoProviderSeeds: DemoSeoProviderSeed[] = [
  'professional-alex-mercer',
  'professional-nina-shaw',
  'professional-sera-james',
  'professional-imogen-ward',
  'professional-maya-reeves',
  'professional-omar-haddad',
  'professional-ella-priest',
  'professional-josh-tan',
  'professional-priya-narayan',
  'professional-leon-keller',
].map((id) => {
  const seed = demoSeoProviderSeedById.get(id)
  if (!seed) throw new Error(`[find-my-seo.demo] Missing provider seed: ${id}`)
  return seed
})

export const demoSeoProviderList: DemoSeoProvider[] = demoSeoProviderSeeds.map(toDemoSeoProvider)

export const demoSeoProfessionalCollection: DemoSeoProfessionalCollectionEntry[] =
  demoSeoProviderList.map(toDemoSeoProfessionalEntry)

export const demoSeoLeadInbox: DemoSeoLeadInquiry[] = []

export const findDemoSeoProviderBySlug = (slug: string) =>
  demoSeoProviderList.find((item) => item.slug === slug) ?? null

export const demoSeoCaseStudiesForProvider = (providerId: string) =>
  demoSeoCaseStudyList.filter((item) => item.ownerEntityId === providerId && item.status === 'published')

export const demoSeoProviderLabel = resolveDemoSeoProviderLabel

export const demoFeaturedSeoProviderList = demoSeoProviderList.filter((item) => item.isFeatured).slice(0, 6)

export const demoSeoSpecialismOptions = [
  'Technical SEO',
  'Local SEO',
  'Google Business Profile',
  'Review strategy',
  'Site migrations',
  'International SEO',
  'Hreflang',
  'Localization strategy',
  'Digital PR',
  'Link building',
  'Authority strategy',
  'Shopify SEO',
  'WordPress SEO',
  'Core Web Vitals',
  'Content systems',
  'Content strategy',
  'Topical authority',
  'Editorial SEO',
  'Revenue reporting',
  'Category SEO',
  'Search merchandising',
]

export const demoSeoProjectTypeOptions = ['One-off', 'Retainer']

export const demoSeoSectorOptions = [
  'SaaS',
  'B2B',
  'Finance',
  'eCommerce',
  'Education',
  'Retail',
  'Consumer',
  'Cybersecurity',
  'Local services',
  'Healthcare',
  'Property services',
  'Travel',
  'Marketplaces',
  'DTC',
  'Shopify',
  'Publishing',
  'Professional services',
  'Enterprise',
]

export const buildDemoSeoLeadId = () => `lead-${Date.now()}`
