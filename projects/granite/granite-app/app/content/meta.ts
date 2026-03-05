import { defineFireuxMeta } from 'fireux-core/runtime/models/system/meta-content.model'

const sourceMeta = {
  name: 'Granite',
  landing: {
    brand: {
      appName: 'Granite',
      bigPersonality: 'Rock Solid',
      headline: 'Portfolio Control',
    },
    heroPrimaryLine:
      'Granite is the <strong>operating system</strong> for landlords, agencies, and portfolio managers. Oversee properties, compliance exposure, documents, incidents, and financial signals from one structured system.',
    primaryCtaLabel: 'Get started',
    consoleBridgeLine:
      'Branch-grade portfolio oversight with audit-ready records and clear accountability.',
    heroBullets: [
      'Compliance oversight across every managed property',
      'Documents organised by client portfolio and asset',
      'Incidents and follow-ups tracked with clear ownership',
      'Finance and advisory signals surfaced at portfolio level',
    ],
    rightPanelItems: [
      {
        title: 'Portfolios',
        description: 'One client portfolio with many properties.',
        icon: 'i-lucide-layers',
      },
      {
        title: 'Compliance',
        description: 'Obligations, evidence, and exposure signals.',
        icon: 'i-lucide-shield-check',
      },
      {
        title: 'Incidents',
        description: 'Repairs, issues, and follow-ups with ownership.',
        icon: 'i-lucide-alert-triangle',
      },
    ],
    seo: {
      title: 'Granite — Rock solid property portfolio control',
      description:
        'A branch console for structured oversight across client portfolios, properties, compliance, documents, and finance signals.',
    },
  },
  about: {
    hero: {
      label: 'Granite',
      tagline: 'Operating System for Portfolio Control',
      description:
        'We run portfolio operations from one branch console, with clear structure for properties, compliance, documents, incidents, and financial signals.',
      supportingCopy:
        'We run portfolio oversight in one branch operating flow, so teams can manage properties, compliance, incidents, documents, and financial signals with clear accountability.',
      primaryAction: {
        label: 'Open portfolio hub',
        to: '/console/portfolio',
      },
      secondaryAction: {
        label: 'Review rollout',
        to: '/get-started',
      },
    },
    panel: {
      title: 'Rock Solid',
      subtitle: 'Portfolio Control',
      ticks: [
        'How Granite modules fit together in operations',
        'The core entities and their relationships',
        'Small realistic sample objects for context',
        'Direct links to public and console surfaces',
      ],
    },
    sections: {
      keyConceptsTitle: 'Granite - Key Concepts (Priority Order)',
      modulesEyebrow: 'Modules',
      modulesTitle: 'How we organize the app',
      modulesDescription:
        'Each module owns a clear operational area, and together they power one portfolio workflow.',
      entitiesEyebrow: 'Entities',
      entitiesTitle: 'The records we work with every day',
      structureEyebrow: 'Structure',
      structureTitle: 'Relationship map',
      examplesEyebrow: 'Examples',
      examplesTitle: 'Sample objects',
      routesTitle: 'Key routes',
    },
    keyConcepts: [
      {
        title: 'Ecosystem',
        description: 'An ecosystem of apps for property portfolio management.',
      },
      {
        title: 'Portfolios',
        description:
          'A portfolio is a structured collection of properties managed as a single investment.',
      },
      {
        title: 'Clients',
        description: 'Clients are the individuals or companies who own the portfolios.',
      },
      {
        title: 'Properties',
        description: 'Properties are the individual assets that make up a portfolio.',
      },
      {
        title: 'Portfolio Control',
        description:
          'Granite provides a structured system to oversee and manage property portfolios.',
      },
      {
        title: 'Financial Signals',
        description:
          'Granite tracks performance indicators such as yield, costs, and portfolio health.',
      },
      {
        title: 'Compliance',
        description:
          'Regulatory requirements, certifications, and safety obligations are tracked across properties.',
      },
      {
        title: 'Documents',
        description:
          'Leases, certificates, contracts, and records are organised per property and portfolio.',
      },
      {
        title: 'Incidents',
        description:
          'Issues such as repairs, complaints, or safety events are recorded and monitored.',
      },
      {
        title: 'Console',
        description:
          'A portfolio console gives managers one place to oversee the entire portfolio.',
      },
    ],
    appSpec: {
      name: 'Granite',
      tagline: 'Operating System for Portfolio Control',
      description:
        'We run portfolio operations from one branch console, with clear structure for properties, compliance, documents, incidents, and financial signals.',
      modules: [
        {
          name: 'fireux-properties',
          summary: 'Portfolio structure and tenancy-facing records.',
          entities: ['Portfolio', 'Property', 'Unit', 'Client'],
        },
        {
          name: 'fireux-compliance',
          summary: 'Compliance definitions and evidence tracking.',
          entities: ['ComplianceItemType', 'ComplianceRecord'],
        },
        {
          name: 'fireux-documents',
          summary: 'Document storage metadata and linking to operational entities.',
          entities: ['Document', 'DocumentLink'],
        },
        {
          name: 'fireux-tasks',
          summary: 'Task workflow for incidents, compliance, and operational follow-up.',
          entities: ['Task'],
        },
        {
          name: 'Identity records',
          summary: 'Shared location and company records used where needed.',
          entities: ['Place', 'Company'],
        },
      ],
      entities: [
        {
          name: 'Portfolio',
          purpose: 'Top-level managed investment or property grouping.',
          keyFields: ['id', 'name', 'owner_label', 'region_label', 'strategy_label'],
          linksTo: ['Property', 'Client', 'Task', 'ComplianceRecord'],
        },
        {
          name: 'Property',
          purpose: 'Managed property asset inside a portfolio.',
          keyFields: ['id', 'portfolio_id', 'title', 'address_label', 'estimated_value'],
          linksTo: ['Unit', 'Client', 'ComplianceRecord', 'DocumentLink', 'Task'],
        },
        {
          name: 'Unit',
          purpose: 'Lettable or manageable unit under a property.',
          keyFields: ['id', 'property_id', 'label', 'status', 'rent_minor'],
          linksTo: ['Client', 'ComplianceRecord', 'DocumentLink'],
        },
        {
          name: 'Client',
          purpose: 'Organization or individual client/occupier relationship record.',
          keyFields: ['id', 'display_name', 'entity_kind', 'status', 'portfolio_id'],
          linksTo: ['Portfolio', 'Property', 'Unit', 'Task'],
        },
        {
          name: 'ComplianceItemType',
          purpose: 'Definition of what evidence is required and how often.',
          keyFields: ['id', 'name', 'scope', 'recurrence_days', 'active'],
          linksTo: ['ComplianceRecord'],
        },
        {
          name: 'ComplianceRecord',
          purpose: 'Actual evidence record with issue/expiry dates and status.',
          keyFields: ['id', 'item_type_id', 'scope_type', 'scope_id', 'expiry_date'],
          linksTo: ['ComplianceItemType', 'DocumentLink', 'Task'],
        },
        {
          name: 'Document',
          purpose: 'Document metadata for files used as operational evidence.',
          keyFields: ['id', 'name', 'mime_type', 'size_bytes', 'storage_path'],
          linksTo: ['DocumentLink'],
        },
        {
          name: 'DocumentLink',
          purpose: 'Bridge that attaches a document to a target entity.',
          keyFields: ['id', 'document_id', 'target_type', 'target_id'],
          linksTo: [
            'Document',
            'Portfolio',
            'Property',
            'Unit',
            'ComplianceRecord',
            'Task',
          ],
        },
        {
          name: 'Task',
          purpose: 'Operational action item for incidents, compliance, and follow-up.',
          keyFields: ['id', 'title', 'status', 'priority', 'linked_entity_type'],
          linksTo: [
            'Portfolio',
            'Property',
            'Unit',
            'ComplianceRecord',
            'DocumentLink',
          ],
        },
        {
          name: 'Place',
          purpose: 'Canonical place identity used by related assets or companies.',
          keyFields: ['id', 'name', 'formatted_address', 'lat', 'lng'],
          linksTo: ['Company', 'Property'],
        },
        {
          name: 'Company',
          purpose: 'Organization identity record used for ownership or counterparties.',
          keyFields: ['id', 'name', 'place_id', 'short_name'],
          linksTo: ['Place', 'Portfolio', 'Client'],
        },
      ],
      samples: [
        {
          entity: 'Portfolio',
          example: {
            id: 'portfolio_rivergate_demo',
            name: 'Rivergate Holdings Demo Portfolio',
            owner_label: 'Rivergate Holdings Ltd',
            region_label: 'Zurich + Bern',
            strategy_label: 'Income stability',
          },
        },
        {
          entity: 'Property',
          example: {
            id: 'prop_langstrasse_14',
            portfolio_id: 'portfolio_rivergate_demo',
            title: 'Langstrasse 14',
            address_label: 'Langstrasse 14, 8004 Zurich',
            estimated_value: 5400000,
          },
        },
        {
          entity: 'Client',
          example: {
            id: 'client_alpine_fund',
            display_name: 'Alpine Residential Fund',
            entity_kind: 'organization',
            status: 'active',
            portfolio_id: 'portfolio_rivergate_demo',
          },
        },
        {
          entity: 'ComplianceRecord',
          example: {
            id: 'comp_fire_alarm_q1',
            item_type_id: 'type_fire_alarm',
            scope_type: 'property',
            scope_id: 'prop_langstrasse_14',
            issue_date: '2026-01-18',
            expiry_date: '2027-01-18',
          },
        },
        {
          entity: 'Task',
          example: {
            id: 'task_leak_4021',
            title: 'Resolve boiler pressure issue',
            status: 'in_progress',
            priority: 'high',
            linked_entity_type: 'property',
            linked_entity_id: 'prop_langstrasse_14',
          },
        },
      ],
      routes: [
        { label: 'Home', path: '/', kind: 'public' },
        { label: 'Get Started', path: '/get-started', kind: 'public' },
        { label: 'Portfolios', path: '/portfolios', kind: 'public' },
        { label: 'Console Entry', path: '/console', kind: 'console' },
        { label: 'Portfolio Hub', path: '/console/portfolio', kind: 'console' },
        { label: 'Properties', path: '/console/portfolio/properties', kind: 'console' },
        { label: 'Clients', path: '/console/portfolio/clients', kind: 'console' },
        { label: 'Compliance', path: '/console/portfolio/compliance', kind: 'console' },
        { label: 'Incidents', path: '/console/portfolio/incidents', kind: 'console' },
        { label: 'Documents', path: '/console/portfolio/documents', kind: 'console' },
        { label: 'Tasks', path: '/console/portfolio/tasks', kind: 'console' },
        { label: 'Finance', path: '/console/portfolio/finance', kind: 'console' },
      ],
    },
    relationshipMap: `
Portfolio
  -> Property
       -> Unit
       -> Client
  -> ComplianceRecord <- ComplianceItemType
  -> Task

Document
  -> DocumentLink
       -> Portfolio | Property | Unit | ComplianceRecord | Task

Place
  -> Company
       -> Portfolio / Client
`,
    seo: {
      title: 'About Granite',
      description:
        'We run portfolio operations from one branch console with structured control across properties, compliance, documents, and tasks.',
    },
  },
  getStarted: {
    hero: {
      eyebrow: 'Get live fast',
      title: 'Run portfolio oversight from one branch console',
      description:
        'Granite structures properties, compliance, documents, incidents, and financial signals so agencies and landlords can operate with clarity.',
      primaryAction: {
        label: 'Open portfolios',
        to: '/console/portfolio',
      },
      secondaryAction: {
        label: 'Review rollout',
        to: '/get-started',
      },
    },
    snapshotTitle: 'Rollout snapshot',
    snapshotTicks: [
      'Portfolio hierarchy and ownership aligned',
      'Compliance exposure and evidence model configured',
      'Incident handling and accountability paths activated',
      'Financial signal tracking ready for operations',
    ],
    stepsHeading: {
      eyebrow: 'Three steps',
      title: 'A practical rollout in three steps',
      description:
        'Set structure first, activate controls next, then run branch operations with confidence.',
    },
    steps: [
      {
        badge: 'Step 1',
        title: 'Portfolio structure',
        copy: 'Define branch portfolios, assets, and ownership lines to establish a clean operating baseline.',
        items: [
          'Portfolio hierarchy set',
          'Property mapping complete',
          'Responsibility lines defined',
        ],
      },
      {
        badge: 'Step 2',
        title: 'Control activation',
        copy: 'Activate compliance tracking, document control, and incident workflows with clear evidence paths.',
        items: ['Compliance model active', 'Document model linked', 'Incident flow enabled'],
      },
      {
        badge: 'Step 3',
        title: 'Operational cadence',
        copy: 'Run ongoing oversight with finance signals and accountability loops at portfolio level.',
        items: ['Monitoring cadence set', 'Signal reporting verified', 'Branch runbook finalized'],
      },
    ],
    seo: {
      title: 'Get Started · Granite',
      description: 'Set up portfolio, compliance, incident, and finance oversight in Granite.',
    },
  },
  roadmap: {
    title: 'Granite Road Map',
    summary:
      'Granite is evolving from structured portfolio control into deeper financial advisory and compliance automation.',
  },
} as const

const aboutHero = sourceMeta.about.hero as {
  label: string
  supportingCopy: string
  primaryAction: { label: string; to: string }
  secondaryAction: { label: string; to: string }
  tagline?: string
  description?: string
}

export const appMeta = {
  name: sourceMeta.name,

  brand: sourceMeta.landing.brand,
  heroPrimaryHtml: sourceMeta.landing.heroPrimaryLine,
  consoleBridgeHtml: sourceMeta.landing.consoleBridgeLine,
  landingPrimaryCtaLabel: sourceMeta.landing.primaryCtaLabel,
  landingSecondaryCtaLabel: sourceMeta.landing.secondaryCtaLabel ?? '',
  landingSecondaryCtaTo: sourceMeta.landing.secondaryCtaTo ?? '',
  heroBullets: sourceMeta.landing.heroBullets,
  heroPanelItems: sourceMeta.landing.rightPanelItems,

  aboutLabel: aboutHero.label,
  tagline: aboutHero.tagline ?? sourceMeta.about.appSpec.tagline,
  description: aboutHero.description ?? sourceMeta.about.appSpec.description,
  aboutSupportingCopy: aboutHero.supportingCopy,
  aboutPrimaryAction: aboutHero.primaryAction,
  aboutSecondaryAction: aboutHero.secondaryAction,
  aboutPanelTitle: sourceMeta.about.panel.title,
  aboutPanelSubtitle: sourceMeta.about.panel.subtitle,
  aboutPanelTicks: sourceMeta.about.panel.ticks,
  aboutSections: sourceMeta.about.sections,
  keyConcepts: sourceMeta.about.keyConcepts,
  modules: sourceMeta.about.appSpec.modules,
  entities: sourceMeta.about.appSpec.entities,
  samples: sourceMeta.about.appSpec.samples,
  routes: sourceMeta.about.appSpec.routes,
  relationshipMap: sourceMeta.about.relationshipMap,

  getStarted: sourceMeta.getStarted,

  seoHome: sourceMeta.landing.seo,
  seoAbout: sourceMeta.about.seo,
  seoGetStarted: sourceMeta.getStarted.seo,

  roadmap: sourceMeta.roadmap,
} as const

const publicRoutes = appMeta.routes
  .filter((route) => route.kind === 'public')
  .map((route) => route.path)

const consoleRoutes = appMeta.routes
  .filter((route) => route.kind === 'console')
  .map((route) => route.path)

export const metaContent = defineFireuxMeta({
  app: {
    id: 'granite',
    name: appMeta.name,
    ecosystem: 'granite',
  },
  copy: {
    big_personality: appMeta.brand.bigPersonality,
    headline: appMeta.brand.headline,
    positioning_html: appMeta.heroPrimaryHtml,
    promise_html: appMeta.aboutSupportingCopy,
    console_bridge_html: appMeta.consoleBridgeHtml,
    about_p1: appMeta.description,
    about_p2: appMeta.aboutSupportingCopy,
    seo_title: appMeta.seoHome.title,
    seo_description: appMeta.seoHome.description,
  },
  cta: {
    primary: {
      label: appMeta.landingPrimaryCtaLabel,
      to: '/get-started',
    },
    secondary:
      appMeta.landingSecondaryCtaLabel && appMeta.landingSecondaryCtaTo
        ? {
            label: appMeta.landingSecondaryCtaLabel,
            to: appMeta.landingSecondaryCtaTo,
          }
        : undefined,
    console: appMeta.aboutPrimaryAction,
    roadmap: {
      label: 'Road map',
      to: '/road-map',
    },
  },
  lists: {
    hero_bullets: appMeta.heroBullets,
    about_ticks: appMeta.aboutPanelTicks,
  },
  entities: appMeta.entities.map((entity) => ({
    id: entity.name,
    purpose: entity.purpose,
  })),
  relations_ascii: appMeta.relationshipMap,
  examples: {
    samples: appMeta.samples,
  },
  routes: {
    public: publicRoutes,
    console: consoleRoutes,
  },
})
