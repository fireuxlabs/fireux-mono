export const sourceMeta = {
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
    workspaceBridgeLine:
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
        'A branch workspace for structured oversight across client portfolios, properties, compliance, documents, and finance signals.',
    },
  },
  about: {
    hero: {
      label: 'Granite',
      tagline: 'Operating System for Portfolio Control',
      description:
        'We run portfolio operations from one branch workspace, with clear structure for properties, compliance, documents, incidents, and financial signals.',
      supportingCopy:
        'We run portfolio oversight in one branch operating flow, so teams can manage properties, compliance, incidents, documents, and financial signals with clear accountability.',
      primaryAction: {
        label: 'Open portfolio hub',
        to: '/workspace/portfolio',
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
        'Direct links to public and workspace surfaces',
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
        title: 'Workspace',
        description:
          'A portfolio workspace gives managers one place to oversee the entire portfolio.',
      },
    ],
    appSpec: {
      name: 'Granite',
      tagline: 'Operating System for Portfolio Control',
      description:
        'We run portfolio operations from one branch workspace, with clear structure for properties, compliance, documents, incidents, and financial signals.',
      modules: [
        {
          name: 'fireux-properties',
          summary: 'Portfolio structure and tenancy-facing records.',
          entities: ['Portfolio', 'Property', 'Unit', 'Client'],
        },
        {
          name: 'fireux-compliance',
          summary: 'Compliance evidence tracking.',
          entities: ['ComplianceRecord'],
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
          keyFields: ['id', 'identity.name', 'identity.owner_label', 'identity.region_label', 'identity.strategy_label'],
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
          name: 'ComplianceRecord',
          purpose: 'Actual evidence record with issue/expiry dates and status.',
          keyFields: ['id', 'item_type_id', 'scope_type', 'scope_id', 'expiry_date'],
          linksTo: ['DocumentLink', 'Task'],
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
      routes: [
        { label: 'Home', path: '/', kind: 'public' },
        { label: 'Get Started', path: '/get-started', kind: 'public' },
        { label: 'Portfolios', path: '/portfolios', kind: 'public' },
        { label: 'Workspace Entry', path: '/workspace', kind: 'workspace' },
        { label: 'Portfolio Hub', path: '/workspace/portfolio', kind: 'workspace' },
        { label: 'Properties', path: '/workspace/portfolio/properties', kind: 'workspace' },
        { label: 'Clients', path: '/workspace/portfolio/clients', kind: 'workspace' },
        { label: 'Compliance', path: '/workspace/portfolio/compliance', kind: 'workspace' },
        { label: 'Incidents', path: '/workspace/portfolio/incidents', kind: 'workspace' },
        { label: 'Documents', path: '/workspace/portfolio/documents', kind: 'workspace' },
        { label: 'Tasks', path: '/workspace/portfolio/tasks', kind: 'workspace' },
        { label: 'Finance', path: '/workspace/portfolio/finance', kind: 'workspace' },
      ],
    },
    relationshipMap: `
Portfolio
  -> Property
       -> Unit
       -> Client
  -> ComplianceRecord
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
        'We run portfolio operations from one branch workspace with structured control across properties, compliance, documents, and tasks.',
    },
  },
  getStarted: {
    hero: {
      eyebrow: 'Get live fast',
      title: 'Run portfolio oversight from one branch workspace',
      description:
        'Granite structures properties, compliance, documents, incidents, and financial signals so agencies and landlords can operate with clarity.',
      primaryAction: {
        label: 'Open portfolios',
        to: '/workspace/portfolio',
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
