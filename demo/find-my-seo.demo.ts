// Repo-level demo payloads for Find My SEO.
// Use these records for dev surfaces, examples, and explicit preflight demos.
// They are not canonical storage or runtime contracts.

export type DemoSeoProviderEntityType = 'professional' | 'company'
export type DemoSeoProviderType = 'consultant' | 'agency'
export type DemoSeoLeadStatus = 'new' | 'contacted' | 'closed'
export type DemoSeoLeadDeliveryState = 'pending' | 'sent' | 'failed'

export type DemoSeoTestimonial = {
  quote: string
  name?: string
  company?: string
}

export type DemoSeoProvider = {
  id: string
  entityType: DemoSeoProviderEntityType
  providerType: DemoSeoProviderType
  slug: string
  displayName: string
  brandName?: string
  avatarUrl?: string
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
  deliveryEmail: string
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
  deliveryState: DemoSeoLeadDeliveryState
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

export const demoFindMySeoOperatorInboxEmail = 'operator@findmyseo.example'

const demoHumanAvatar = (photoId: string) =>
  `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=240&q=80`

const demoProviderLogo = (seed: string) =>
  `https://api.dicebear.com/9.x/shapes/svg?seed=${encodeURIComponent(`find-my-seo-${seed}`)}`

export const demoSeoProviderList: DemoSeoProvider[] = [
  {
    id: 'professional-alex-mercer',
    entityType: 'professional',
    providerType: 'consultant',
    slug: 'alex-mercer-technical-seo',
    displayName: 'Alex Mercer',
    brandName: 'Mercer Search',
    avatarUrl: demoHumanAvatar('1528892952291-009c663ce843'),
    logoUrl: demoProviderLogo('mercer-search'),
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
    rating: 4.9,
    reviewCount: 18,
    contactEmail: 'alex@mercersearch.example',
    isVerified: true,
    isFeatured: true,
    source: 'demo',
    isDemo: true,
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
    avatarUrl: demoHumanAvatar('1544723795-3fb6469f5b39'),
    logoUrl: demoProviderLogo('shaw-organic'),
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
    rating: 4.8,
    reviewCount: 14,
    contactEmail: 'nina@shaworganic.example',
    isVerified: true,
    isFeatured: false,
    source: 'demo',
    isDemo: true,
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
    logoUrl: demoProviderLogo('serp-forged'),
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
    rating: 4.9,
    reviewCount: 31,
    contactEmail: 'hello@serpforged.example',
    isVerified: true,
    isFeatured: true,
    source: 'demo',
    isDemo: true,
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
    logoUrl: demoProviderLogo('canvas-growth'),
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
    rating: 4.7,
    reviewCount: 22,
    contactEmail: 'team@canvasgrowth.example',
    isVerified: false,
    isFeatured: false,
    source: 'demo',
    isDemo: true,
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
  {
    id: 'professional-maya-reeves',
    entityType: 'professional',
    providerType: 'consultant',
    slug: 'maya-reeves-local-seo',
    displayName: 'Maya Reeves',
    brandName: 'Map Pack Studio',
    avatarUrl: demoHumanAvatar('1494790108377-be9c29b29330'),
    logoUrl: demoProviderLogo('map-pack-studio'),
    headline: 'Local SEO specialist for service businesses and multi-location brands',
    summary:
      'Maya helps local businesses turn search visibility into booked appointments, calls, and stronger location-level trust.',
    bio:
      'Maya is strongest when the problem is local intent: Google Business Profile quality, location pages, reviews, and practical reporting that busy operators can understand.',
    locationLabel: 'Birmingham, UK',
    remoteAvailable: true,
    yearsExperience: 9,
    sectorExperience: ['Local services', 'Healthcare', 'Property services'],
    specialisms: ['Local SEO', 'Google Business Profile', 'Review strategy'],
    servicesOffered: ['Local SEO audit', 'Location page planning', 'GBP optimisation'],
    projectTypes: ['One-off', 'Retainer'],
    pricingGuidance: 'Projects from GBP1.2k, retainers from GBP1.8k / month',
    availabilityStatus: 'Available this month',
    rating: 4.8,
    reviewCount: 26,
    contactEmail: 'maya@mappackstudio.example',
    isVerified: true,
    isFeatured: true,
    source: 'demo',
    isDemo: true,
    trustNote: 'Reviewed example profile for local SEO and service business discovery.',
    testimonials: [
      {
        quote: 'Maya made local SEO feel manageable and turned our location pages into real enquiry drivers.',
        name: 'Operations Lead',
        company: 'Regional repairs group',
      },
    ],
    proofHighlights: [
      'Improved map pack visibility across 14 service locations',
      'Built a repeatable review and location-page workflow',
    ],
    featuredCaseStudyIds: ['case-local-service-map-pack'],
  },
  {
    id: 'professional-omar-haddad',
    entityType: 'professional',
    providerType: 'consultant',
    slug: 'omar-haddad-international-seo',
    displayName: 'Omar Haddad',
    brandName: 'Borderless Search',
    avatarUrl: demoHumanAvatar('1506794778202-cad84cf45f1d'),
    logoUrl: demoProviderLogo('borderless-search'),
    headline: 'International SEO consultant for multilingual and multi-market sites',
    summary:
      'Omar helps teams untangle hreflang, localization, and market-level search intent before international growth gets expensive.',
    bio:
      'Omar works with teams expanding into new regions or cleaning up international technical debt. His approach balances technical accuracy with market-specific content decisions.',
    locationLabel: 'Berlin, DE',
    remoteAvailable: true,
    yearsExperience: 10,
    sectorExperience: ['SaaS', 'Travel', 'Marketplaces'],
    specialisms: ['International SEO', 'Hreflang', 'Localization strategy'],
    servicesOffered: ['International SEO audit', 'Market rollout plan', 'Localization QA'],
    projectTypes: ['One-off', 'Retainer'],
    pricingGuidance: 'Projects from GBP3.5k',
    availabilityStatus: 'Available in 3 weeks',
    rating: 4.9,
    reviewCount: 16,
    contactEmail: 'omar@borderlesssearch.example',
    isVerified: true,
    isFeatured: false,
    source: 'demo',
    isDemo: true,
    trustNote: 'Reviewed example profile for international SEO review.',
    testimonials: [
      {
        quote: 'Omar helped us stop competing with ourselves across markets.',
        name: 'SEO Lead',
        company: 'Travel marketplace',
      },
    ],
    proofHighlights: [
      'Resolved hreflang conflicts across 9 country sites',
      'Mapped market-specific landing page priorities',
    ],
    featuredCaseStudyIds: ['case-international-hreflang-cleanup'],
  },
  {
    id: 'professional-ella-priest',
    entityType: 'professional',
    providerType: 'consultant',
    slug: 'ella-priest-digital-pr',
    displayName: 'Ella Priest',
    brandName: 'Signal PR',
    avatarUrl: demoHumanAvatar('1534528741775-53994a69daeb'),
    logoUrl: demoProviderLogo('signal-pr'),
    headline: 'Digital PR and link building specialist for authority-led SEO',
    summary:
      'Ella builds link-worthy campaigns that support search growth without drifting into empty publicity metrics.',
    bio:
      'Ella is a fit for teams that need earned authority, journalist-friendly stories, and campaigns tied back to priority pages and ranking opportunities.',
    locationLabel: 'Leeds, UK',
    remoteAvailable: true,
    yearsExperience: 7,
    sectorExperience: ['Finance', 'Consumer', 'Property'],
    specialisms: ['Digital PR', 'Link building', 'Authority strategy'],
    servicesOffered: ['Campaign ideation', 'Outreach', 'Link gap analysis'],
    projectTypes: ['One-off', 'Retainer'],
    pricingGuidance: 'Campaigns from GBP4k',
    availabilityStatus: 'Taking campaign briefs now',
    rating: 4.7,
    reviewCount: 19,
    contactEmail: 'ella@signalpr.example',
    isVerified: true,
    isFeatured: false,
    source: 'demo',
    isDemo: true,
    trustNote: 'Reviewed example profile for digital PR and authority building.',
    testimonials: [
      {
        quote: 'Ella gave our SEO and PR teams a shared campaign language.',
        name: 'Brand Manager',
        company: 'Consumer finance brand',
      },
    ],
    proofHighlights: [
      'Landed authority links to commercial support content',
      'Built campaign angles from search opportunity data',
    ],
    featuredCaseStudyIds: ['case-digital-pr-authority'],
  },
  {
    id: 'professional-josh-tan',
    entityType: 'professional',
    providerType: 'consultant',
    slug: 'josh-tan-shopify-seo',
    displayName: 'Josh Tan',
    brandName: 'Shop Rank Lab',
    avatarUrl: demoHumanAvatar('1500648767791-00dcc994a43e'),
    logoUrl: demoProviderLogo('shop-rank-lab'),
    headline: 'Shopify SEO expert for growing DTC and retail stores',
    summary:
      'Josh helps Shopify teams clean up product, collection, and theme-level SEO issues without slowing merchandising down.',
    bio:
      'Josh is practical, technical, and commerce-minded. He works best with brands that need SEO improvements shipped through Shopify constraints.',
    locationLabel: 'Glasgow, UK',
    remoteAvailable: true,
    yearsExperience: 6,
    sectorExperience: ['Shopify', 'DTC', 'Retail'],
    specialisms: ['Shopify SEO', 'Category SEO', 'Technical SEO'],
    servicesOffered: ['Shopify audit', 'Collection page strategy', 'Theme SEO review'],
    projectTypes: ['One-off', 'Retainer'],
    pricingGuidance: 'Audits from GBP1.5k',
    availabilityStatus: 'Available this month',
    rating: 4.8,
    reviewCount: 12,
    contactEmail: 'josh@shopranklab.example',
    isVerified: true,
    isFeatured: true,
    source: 'demo',
    isDemo: true,
    trustNote: 'Reviewed example profile for Shopify SEO.',
    testimonials: [
      {
        quote: 'Josh found issues our theme team could actually fix quickly.',
        name: 'Founder',
        company: 'DTC skincare brand',
      },
    ],
    proofHighlights: [
      'Improved collection page indexation and internal linking',
      'Reduced duplicate product URL bloat',
    ],
    featuredCaseStudyIds: ['case-shopify-collection-growth'],
  },
  {
    id: 'professional-priya-narayan',
    entityType: 'professional',
    providerType: 'consultant',
    slug: 'priya-narayan-wordpress-seo',
    displayName: 'Priya Narayan',
    brandName: 'WP Search Works',
    avatarUrl: demoHumanAvatar('1517841905240-472988babdf9'),
    logoUrl: demoProviderLogo('wp-search-works'),
    headline: 'WordPress SEO consultant for publishers, services, and content-heavy sites',
    summary:
      'Priya helps WordPress teams improve technical hygiene, content structure, and page speed without rebuilding the whole site.',
    bio:
      'Priya is a good fit for teams with mature WordPress sites that need better templates, better internal linking, and cleaner editorial governance.',
    locationLabel: 'Cardiff, UK',
    remoteAvailable: true,
    yearsExperience: 12,
    sectorExperience: ['Publishing', 'Professional services', 'Education'],
    specialisms: ['WordPress SEO', 'Core Web Vitals', 'Content systems'],
    servicesOffered: ['WordPress audit', 'Template review', 'Editorial SEO systems'],
    projectTypes: ['One-off', 'Retainer'],
    pricingGuidance: 'Projects from GBP2k',
    availabilityStatus: 'Available next month',
    rating: 4.9,
    reviewCount: 28,
    contactEmail: 'priya@wpsearchworks.example',
    isVerified: true,
    isFeatured: false,
    source: 'demo',
    isDemo: true,
    trustNote: 'Reviewed example profile for WordPress SEO.',
    testimonials: [
      {
        quote: 'Priya helped us fix years of content and template drift without a risky rebuild.',
        name: 'Editorial Director',
        company: 'Education publisher',
      },
    ],
    proofHighlights: [
      'Improved template-level search quality across 1,200 articles',
      'Reduced slow-page clusters on commercial guides',
    ],
    featuredCaseStudyIds: ['case-wordpress-template-cleanup'],
  },
  {
    id: 'company-bright-crawl',
    entityType: 'company',
    providerType: 'agency',
    slug: 'bright-crawl-technical-seo-agency',
    displayName: 'Bright Crawl',
    brandName: 'Bright Crawl',
    logoUrl: demoProviderLogo('bright-crawl'),
    headline: 'Technical SEO agency for enterprise audits, migrations, and governance',
    summary:
      'Bright Crawl gives larger teams the audit depth and delivery structure needed to move SEO fixes through engineering backlogs.',
    bio:
      'This agency is a fit for companies with complex sites, multiple stakeholders, and the need for clear prioritisation across engineering, product, and marketing.',
    locationLabel: 'Remote-first, EU',
    remoteAvailable: true,
    teamSizeLabel: '15-person technical team',
    sectorExperience: ['Enterprise', 'SaaS', 'Marketplaces'],
    specialisms: ['Technical SEO', 'Site migrations', 'SEO governance'],
    servicesOffered: ['Enterprise audit', 'Migration support', 'Engineering backlog planning'],
    projectTypes: ['One-off', 'Retainer'],
    pricingGuidance: 'Projects from GBP8k',
    availabilityStatus: 'Discovery slots open',
    rating: 4.8,
    reviewCount: 24,
    contactEmail: 'hello@brightcrawl.example',
    isVerified: true,
    isFeatured: true,
    source: 'demo',
    isDemo: true,
    trustNote: 'Reviewed example profile for enterprise technical SEO.',
    testimonials: [
      {
        quote: 'Bright Crawl made our SEO backlog legible to product and engineering.',
        name: 'Product Director',
        company: 'B2B marketplace',
      },
    ],
    proofHighlights: [
      'Prioritised 400 crawl issues into a shippable engineering plan',
      'Protected launch visibility during a multi-market migration',
    ],
    featuredCaseStudyIds: ['case-enterprise-technical-governance'],
  },
]

export const demoSeoCaseStudyList: DemoSeoCaseStudy[] = [
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
  {
    id: 'case-local-service-map-pack',
    ownerEntityType: 'professional',
    ownerEntityId: 'professional-maya-reeves',
    slug: 'local-service-map-pack-growth',
    status: 'published',
    title: 'Local service map pack growth',
    clientLabel: 'Regional property services group',
    clientType: 'Local service business',
    sector: 'Local services',
    problem: 'Location pages were thin and Google Business Profile data was inconsistent across service areas.',
    actions: ['Rebuilt service-area pages', 'Standardised GBP fields', 'Introduced review request workflows'],
    resultsSummary: 'Improved local visibility and turned location pages into a clearer enquiry path.',
    metrics: [
      { label: 'Qualified local enquiries', value: '+46%' },
      { label: 'Timeframe', value: '3 months' },
    ],
    timeframeLabel: '3 months',
    isFeatured: true,
  },
  {
    id: 'case-international-hreflang-cleanup',
    ownerEntityType: 'professional',
    ownerEntityId: 'professional-omar-haddad',
    slug: 'international-hreflang-cleanup',
    status: 'published',
    title: 'International hreflang cleanup',
    clientLabel: 'Travel marketplace',
    clientType: 'Marketplace',
    sector: 'Travel',
    problem: 'Country folders were competing with each other and localized pages were inconsistently indexed.',
    actions: ['Audited hreflang clusters', 'Mapped market-specific intent', 'Rebuilt localization QA checks'],
    resultsSummary: 'Reduced international cannibalisation and improved market-level landing page confidence.',
    metrics: [
      { label: 'Hreflang conflicts resolved', value: '91%' },
      { label: 'Timeframe', value: '6 weeks' },
    ],
    timeframeLabel: '6 weeks',
    isFeatured: false,
  },
  {
    id: 'case-digital-pr-authority',
    ownerEntityType: 'professional',
    ownerEntityId: 'professional-ella-priest',
    slug: 'digital-pr-authority',
    status: 'published',
    title: 'Authority campaign for commercial SEO',
    clientLabel: 'Consumer finance brand',
    clientType: 'Finance brand',
    sector: 'Finance',
    problem: 'The brand had useful content but weak authority around priority comparison topics.',
    actions: ['Built journalist-friendly data angles', 'Mapped outreach to priority URLs', 'Tracked links by commercial theme'],
    resultsSummary: 'Earned relevant links while keeping campaign reporting tied to search opportunity.',
    metrics: [
      { label: 'Relevant referring domains', value: '42' },
      { label: 'Priority page visibility lift', value: '29%' },
    ],
    timeframeLabel: '10 weeks',
    isFeatured: false,
  },
  {
    id: 'case-shopify-collection-growth',
    ownerEntityType: 'professional',
    ownerEntityId: 'professional-josh-tan',
    slug: 'shopify-collection-growth',
    status: 'published',
    title: 'Shopify collection growth reset',
    clientLabel: 'DTC skincare brand',
    clientType: 'Shopify store',
    sector: 'DTC',
    problem: 'Collection pages lacked unique structure and product URL variants were creating crawl waste.',
    actions: ['Cleaned duplicate URL patterns', 'Rebuilt collection copy modules', 'Added internal links from guides'],
    resultsSummary: 'Made priority collections more indexable and easier to merchandise from content.',
    metrics: [
      { label: 'Collection clicks', value: '+37%' },
      { label: 'Timeframe', value: '4 months' },
    ],
    timeframeLabel: '4 months',
    isFeatured: true,
  },
  {
    id: 'case-wordpress-template-cleanup',
    ownerEntityType: 'professional',
    ownerEntityId: 'professional-priya-narayan',
    slug: 'wordpress-template-cleanup',
    status: 'published',
    title: 'WordPress template cleanup',
    clientLabel: 'Education publisher',
    clientType: 'Publisher',
    sector: 'Education',
    problem: 'Years of editorial growth left the site with slow templates, weak internal links, and inconsistent article structure.',
    actions: ['Audited template patterns', 'Rebuilt internal-link modules', 'Created editorial SEO checks'],
    resultsSummary: 'Improved quality and discoverability without forcing a platform rebuild.',
    metrics: [
      { label: 'Slow-page clusters reduced', value: '64%' },
      { label: 'Guide traffic lift', value: '31%' },
    ],
    timeframeLabel: '5 months',
    isFeatured: false,
  },
  {
    id: 'case-enterprise-technical-governance',
    ownerEntityType: 'company',
    ownerEntityId: 'company-bright-crawl',
    slug: 'enterprise-technical-governance',
    status: 'published',
    title: 'Enterprise technical governance',
    clientLabel: 'B2B marketplace',
    clientType: 'Marketplace',
    sector: 'B2B',
    problem: 'Engineering teams had hundreds of SEO tickets but no impact model or release sequence.',
    actions: ['Grouped crawl issues by template', 'Scored backlog by commercial risk', 'Built release-ready engineering briefs'],
    resultsSummary: 'Turned a noisy audit into a prioritized delivery plan that product teams could act on.',
    metrics: [
      { label: 'Issues triaged', value: '400+' },
      { label: 'Critical templates fixed', value: '11' },
    ],
    timeframeLabel: '8 weeks',
    isFeatured: true,
  },
]

export const demoSeoLeadInbox: DemoSeoLeadInquiry[] = [
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

export const findDemoSeoProviderBySlug = (slug: string) =>
  demoSeoProviderList.find((item) => item.slug === slug) ?? null

export const demoSeoCaseStudiesForProvider = (providerId: string) =>
  demoSeoCaseStudyList.filter((item) => item.ownerEntityId === providerId && item.status === 'published')

export const demoSeoProviderLabel = (provider: Pick<DemoSeoProvider, 'providerType'>) =>
  provider.providerType === 'agency' ? 'Agency' : 'Consultant'

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
