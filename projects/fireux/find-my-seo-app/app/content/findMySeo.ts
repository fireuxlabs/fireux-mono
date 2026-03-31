export type ProviderEntityType = 'professional' | 'company'
export type ProviderType = 'consultant' | 'agency'
export type LeadStatus = 'new' | 'contacted' | 'closed'
export type LeadDeliveryState = 'pending' | 'sent' | 'failed'

export type Testimonial = {
  quote: string
  name?: string
  company?: string
}

export type SeoProvider = {
  id: string
  entityType: ProviderEntityType
  providerType: ProviderType
  slug: string
  displayName: string
  brandName?: string
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
  contactEmail?: string
  isVerified: boolean
  isFeatured: boolean
  trustNote?: string
  testimonials: Testimonial[]
  proofHighlights: string[]
  featuredCaseStudyIds: string[]
}

export type SeoCaseStudy = {
  id: string
  ownerEntityType: ProviderEntityType
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

export type LeadInquiry = {
  id: string
  providerEntityType: ProviderEntityType
  providerEntityId: string
  providerSlug: string
  providerDisplayName: string
  deliveryEmail: string
  status: LeadStatus
  contactName: string
  contactEmail: string
  companyName: string
  websiteUrl?: string
  sector?: string
  projectSummary: string
  budgetRange: string
  timeline: string
  consentContact: boolean
  deliveryState: LeadDeliveryState
  createdAt: string
}

export type LeadDraft = {
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

export const operatorInboxEmail = 'operator@findmyseo.example'

export const seoProviders: SeoProvider[] = [
  {
    id: 'professional-alex-mercer',
    entityType: 'professional',
    providerType: 'consultant',
    slug: 'alex-mercer-technical-seo',
    displayName: 'Alex Mercer',
    brandName: 'Mercer Search',
    headline: 'Technical SEO consultant for replatforming and recovery work',
    summary:
      'Alex helps B2B and finance teams recover from migration losses, clear technical debt, and turn SEO into a board-level growth channel.',
    bio:
      'Alex works best with teams facing complex platform changes, indexation drift, or slow-moving technical backlogs. His positioning is direct: fix the site, protect revenue pages, and show the commercial impact clearly.',
    locationLabel: 'London, UK',
    remoteAvailable: true,
    yearsExperience: 11,
    sectorExperience: ['SaaS', 'B2B', 'Finance'],
    specialisms: ['Technical SEO', 'Site migrations', 'Content systems'],
    servicesOffered: ['Audits', 'Technical fixes', 'Growth roadmaps'],
    projectTypes: ['One-off', 'Retainer'],
    pricingGuidance: 'GBP2.5k to GBP6k / month',
    availabilityStatus: 'Available in 2 weeks',
    contactEmail: 'alex@mercersearch.example',
    isVerified: true,
    isFeatured: true,
    trustNote: 'Featured by Charlie for high-stakes technical recovery work.',
    testimonials: [
      {
        quote: 'Alex gave us the first migration recovery plan that both engineering and marketing trusted.',
        name: 'Head of Growth',
        company: 'B2B fintech',
      },
    ],
    proofHighlights: [
      'Recovered 38 percent of lost non-brand traffic after a replatform',
      'Built issue-to-impact reporting for CTO and CMO visibility',
    ],
    featuredCaseStudyIds: ['case-finance-recovery'],
  },
  {
    id: 'professional-nina-shaw',
    entityType: 'professional',
    providerType: 'consultant',
    slug: 'nina-shaw-content-seo',
    displayName: 'Nina Shaw',
    brandName: 'Shaw Organic',
    headline: 'Content-led SEO strategist for editorial and category growth',
    summary:
      'Nina builds content systems that compound. She works best with teams that want repeatable publishing strategy, stronger briefs, and cleaner commercial alignment.',
    bio:
      'Nina sits between editorial clarity and commercial discipline. Her strongest work comes when a team needs structured content strategy rather than another backlog of disconnected blog ideas.',
    locationLabel: 'Manchester, UK',
    remoteAvailable: true,
    yearsExperience: 8,
    sectorExperience: ['eCommerce', 'SaaS', 'Education'],
    specialisms: ['Content strategy', 'Topical authority', 'Editorial SEO'],
    servicesOffered: ['Content strategy', 'Audits', 'Fractional leadership'],
    projectTypes: ['Retainer'],
    pricingGuidance: 'GBP3k to GBP8k / month',
    availabilityStatus: '1 retainer slot open',
    contactEmail: 'nina@shaworganic.example',
    isVerified: true,
    isFeatured: false,
    trustNote: 'Profile reviewed by Find My SEO for strategy depth and proof quality.',
    testimonials: [
      {
        quote: 'Nina replaced random content production with a system our whole marketing team could actually follow.',
        name: 'Marketing Director',
        company: 'Education SaaS',
      },
    ],
    proofHighlights: [
      'Scaled category and editorial traffic 4.2x in 9 months',
      'Merged CRO and SEO briefs into one planning rhythm',
    ],
    featuredCaseStudyIds: ['case-commerce-authority'],
  },
  {
    id: 'company-serpforged',
    entityType: 'company',
    providerType: 'agency',
    slug: 'serpforged-b2b-seo-agency',
    displayName: 'SERP Forged',
    brandName: 'SERP Forged',
    headline: 'B2B SEO agency for pipeline-focused SaaS and demand generation teams',
    summary:
      'SERP Forged combines technical, content, and reporting support for SaaS teams that need SEO tied to pipeline, not vanity traffic.',
    bio:
      'This agency suits teams that want operator depth without building a full in-house SEO function. They package strategy, implementation, and reporting in one retained delivery model.',
    locationLabel: 'Remote-first, UK',
    remoteAvailable: true,
    teamSizeLabel: '8-person specialist team',
    sectorExperience: ['SaaS', 'B2B', 'Cybersecurity'],
    specialisms: ['Technical SEO', 'Content strategy', 'Revenue reporting'],
    servicesOffered: ['Retainers', 'Strategy sprints', 'SEO forecasting'],
    projectTypes: ['Retainer', 'One-off'],
    pricingGuidance: 'Retainers from GBP6k / month',
    availabilityStatus: 'Discovery slots available this month',
    contactEmail: 'hello@serpforged.example',
    isVerified: true,
    isFeatured: true,
    trustNote: 'Featured by Charlie for commercial clarity and mature SaaS execution.',
    testimonials: [
      {
        quote: 'They think like an internal growth team, not an outsourced traffic shop.',
        name: 'VP Marketing',
        company: 'SaaS scale-up',
      },
    ],
    proofHighlights: [
      'Built SEO reporting tied to pipeline stages and opportunity influence',
      'Lifted demo-intent organic traffic across key commercial pages',
    ],
    featuredCaseStudyIds: ['case-saas-pipeline'],
  },
  {
    id: 'company-canvas-growth',
    entityType: 'company',
    providerType: 'agency',
    slug: 'canvas-growth-ecommerce-agency',
    displayName: 'Canvas Growth',
    brandName: 'Canvas Growth',
    headline: 'eCommerce SEO agency for category growth, merchandising, and technical clean-up',
    summary:
      'Canvas Growth helps retail and eCommerce teams align category structure, content support, and technical performance around revenue-driving search demand.',
    bio:
      'Canvas Growth is a fit for teams that need both category-level strategy and implementation support. Their strongest positioning is around commercial categories, internal linking, and search-led merchandising.',
    locationLabel: 'Bristol, UK',
    remoteAvailable: true,
    teamSizeLabel: '12-person agency team',
    sectorExperience: ['eCommerce', 'Retail', 'Consumer'],
    specialisms: ['Category SEO', 'Technical SEO', 'Search merchandising'],
    servicesOffered: ['Retainers', 'Category roadmaps', 'Technical fixes'],
    projectTypes: ['Retainer', 'One-off'],
    pricingGuidance: 'Projects from GBP4k, retainers from GBP5.5k / month',
    availabilityStatus: 'Next onboarding window opens in 3 weeks',
    contactEmail: 'team@canvasgrowth.example',
    isVerified: false,
    isFeatured: false,
    trustNote: 'Case studies reviewed by Find My SEO.',
    testimonials: [
      {
        quote: 'Canvas helped us join merchandising, content, and SEO planning in a way we had never managed internally.',
        name: 'eCommerce Director',
        company: 'Retail brand',
      },
    ],
    proofHighlights: [
      'Reworked category architecture to support commercial demand clusters',
      'Improved internal-link flow to priority revenue pages',
    ],
    featuredCaseStudyIds: ['case-retail-category-growth'],
  },
]

export const seoCaseStudies: SeoCaseStudy[] = [
  {
    id: 'case-finance-recovery',
    ownerEntityType: 'professional',
    ownerEntityId: 'professional-alex-mercer',
    slug: 'finance-migration-recovery',
    status: 'published',
    title: 'Finance migration recovery',
    clientLabel: 'Mid-market finance platform',
    clientType: 'B2B platform',
    sector: 'Finance',
    problem: 'Traffic dropped after a CMS and IA migration with major internal linking drift.',
    actions: ['Ran template-level crawl analysis', 'Mapped redirects and orphaned sections', 'Rebuilt indexation and internal link rules'],
    resultsSummary: 'Recovered traffic and restored priority commercial visibility after a high-risk replatform.',
    metrics: [
      { label: 'Non-brand traffic recovery', value: '38%' },
      { label: 'Timeframe', value: '4 months' },
    ],
    timeframeLabel: '4 months',
    isFeatured: true,
  },
  {
    id: 'case-commerce-authority',
    ownerEntityType: 'professional',
    ownerEntityId: 'professional-nina-shaw',
    slug: 'ecommerce-topical-authority-rollout',
    status: 'published',
    title: 'eCommerce topical authority rollout',
    clientLabel: 'Category-led eCommerce brand',
    clientType: 'Retail brand',
    sector: 'eCommerce',
    problem: 'The site had product pages but no editorial structure supporting category demand.',
    actions: ['Built topic clusters', 'Aligned merch, category, and editorial planning', 'Created new content briefs and governance rules'],
    resultsSummary: 'Turned disconnected content efforts into a structured category-support system.',
    metrics: [
      { label: 'Organic sessions', value: '4.2x' },
      { label: 'Assisted revenue lift', value: '22%' },
    ],
    timeframeLabel: '9 months',
    isFeatured: true,
  },
  {
    id: 'case-saas-pipeline',
    ownerEntityType: 'company',
    ownerEntityId: 'company-serpforged',
    slug: 'saas-pipeline-led-seo-program',
    status: 'published',
    title: 'SaaS pipeline-led SEO program',
    clientLabel: 'Series B workflow SaaS',
    clientType: 'SaaS',
    sector: 'SaaS',
    problem: 'The client had traffic growth but weak commercial intent and poor reporting into pipeline.',
    actions: ['Rebuilt page segmentation around commercial intent', 'Added reporting against demo and opportunity stages', 'Aligned roadmap with demand generation priorities'],
    resultsSummary: 'Moved SEO reporting from vanity metrics to a pipeline contribution story buyers could trust.',
    metrics: [
      { label: 'Demo-intent traffic lift', value: '61%' },
      { label: 'Sales-qualified pipeline influence', value: '2.3x' },
    ],
    timeframeLabel: '6 months',
    isFeatured: true,
  },
  {
    id: 'case-retail-category-growth',
    ownerEntityType: 'company',
    ownerEntityId: 'company-canvas-growth',
    slug: 'retail-category-growth',
    status: 'published',
    title: 'Retail category growth reset',
    clientLabel: 'Multi-category retail brand',
    clientType: 'eCommerce',
    sector: 'eCommerce',
    problem: 'Category pages were thin, internal-linking was weak, and merchandising priorities were disconnected from search demand.',
    actions: ['Rebuilt category hierarchy', 'Introduced demand-led linking patterns', 'Aligned search-led merchandising recommendations with priority pages'],
    resultsSummary: 'Improved category visibility and made revenue pages easier for teams to prioritize.',
    metrics: [
      { label: 'Commercial page visibility lift', value: '34%' },
      { label: 'Priority category revenue lift', value: '18%' },
    ],
    timeframeLabel: '5 months',
    isFeatured: false,
  },
]

export const initialLeadInbox: LeadInquiry[] = [
  {
    id: 'lead-001',
    providerEntityType: 'professional',
    providerEntityId: 'professional-alex-mercer',
    providerSlug: 'alex-mercer-technical-seo',
    providerDisplayName: 'Alex Mercer',
    deliveryEmail: 'alex@mercersearch.example',
    status: 'new',
    contactName: 'Ava Patel',
    contactEmail: 'ava@ledgerforge.example',
    companyName: 'Ledger Forge',
    projectSummary: 'Recover traffic after a migration and clean up technical debt.',
    budgetRange: 'GBP5k / month',
    timeline: 'Need help next month',
    consentContact: true,
    deliveryState: 'sent',
    createdAt: '2026-03-20T10:00:00.000Z',
  },
  {
    id: 'lead-002',
    providerEntityType: 'company',
    providerEntityId: 'company-serpforged',
    providerSlug: 'serpforged-b2b-seo-agency',
    providerDisplayName: 'SERP Forged',
    deliveryEmail: 'hello@serpforged.example',
    status: 'contacted',
    contactName: 'Luca Meyer',
    contactEmail: 'luca@classloom.example',
    companyName: 'Classloom',
    sector: 'SaaS',
    projectSummary: 'Need an SEO partner for a category and demo-intent growth program.',
    budgetRange: 'GBP7k / month',
    timeline: 'Q2 kickoff',
    consentContact: true,
    deliveryState: 'sent',
    createdAt: '2026-03-22T14:30:00.000Z',
  },
]

export const providerBySlug = (slug: string) =>
  seoProviders.find((item) => item.slug === slug) ?? null

export const caseStudiesForProvider = (providerId: string) =>
  seoCaseStudies.filter((item) => item.ownerEntityId === providerId && item.status === 'published')

export const providerLabel = (provider: Pick<SeoProvider, 'providerType'>) =>
  provider.providerType === 'agency' ? 'Agency' : 'Consultant'

export const featuredProviders = seoProviders.filter((item) => item.isFeatured).slice(0, 6)

export const allSpecialismOptions = [
  'Technical SEO',
  'Site migrations',
  'Content systems',
  'Content strategy',
  'Topical authority',
  'Editorial SEO',
  'Revenue reporting',
  'Category SEO',
  'Search merchandising',
]

export const allProjectTypeOptions = ['One-off', 'Retainer']

export const allSectorOptions = [
  'SaaS',
  'B2B',
  'Finance',
  'eCommerce',
  'Education',
  'Retail',
  'Consumer',
  'Cybersecurity',
]

export const buildLeadId = () => `lead-${Date.now()}`
