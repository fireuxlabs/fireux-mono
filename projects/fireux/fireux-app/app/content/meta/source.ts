export const fireuxOffer = {
  heroDescription:
    'Request a FireUX App through Ignition or explore an existing Ecosystem. The Project Console reviews Apps, Ecosystems, and new App users.',
  heroBullets: [
    'Send an App request through Ignition',
    'Review Project Apps and Ecosystems',
    'Monitor new App users',
    'Browse public Apps, Solutions, Operations, and Modules',
  ],
  entry: {
    description:
      'Request a FireUX App through Ignition, or explore an Ecosystem that already covers your work.',
    request: {
      title: 'Request a FireUX App',
      description: 'Send an Ignition request. We review the scope before work starts.',
      actionLabel: 'Request an App',
    },
    ecosystems: {
      title: 'Explore Ecosystems',
      description: 'Browse published Ecosystems and see which Apps they group.',
      actionLabel: 'Explore Ecosystems',
    },
  },
  ignition: {
    description:
      'Tell us what the App needs to do. Ignition records your request for review and scope.',
    requestTitle: 'Request a FireUX App',
    requestDescription:
      'Tell us what the App needs to do. No payment is taken here.',
    confirmationSteps: [
      { title: 'Review', description: 'We check your request.' },
      {
        title: 'Scope',
        description: 'We agree the App, pages, access, and price.',
      },
      {
        title: 'Configure',
        description: 'We configure the agreed App.',
      },
    ],
  },
} as const

export const sourceMeta = {
  name: 'FireUX',
  landing: {
    brand: {
      appName: 'fireux',
      bigPersonality: 'Ignite With',
      headline: 'FireUX',
    },
    heroPrimaryLine: fireuxOffer.heroDescription,
    primaryCtaLabel: 'Get started',
    secondaryCtaLabel: 'Browse apps',
    secondaryCtaTo: '/apps',
    consoleBridgeLine:
      'The Project Console brings Ignition, Apps, the selected Ecosystem, and new users together for each FireUX Project.',
    heroBullets: fireuxOffer.heroBullets,
    rightPanelItems: [
      {
        title: 'Ignition',
        description: 'Capture an App request and work through its launch checklist.',
        icon: 'i-lucide-rocket',
      },
      {
        title: 'Apps',
        description: 'Review the Apps connected to the selected Project.',
        icon: 'i-lucide-app-window',
      },
      {
        title: 'Ecosystem',
        description: 'Review the Project Ecosystem and the Apps inside it.',
        icon: 'i-lucide-orbit',
      },
    ],
    seo: {
      title: 'FireUX — Projects, Apps, and Ecosystems',
      description: fireuxOffer.heroDescription,
    },
  },
  about: {
    hero: {
      label: 'About FireUX',
      supportingCopy:
        'FireUX also publishes the Apps, Ecosystems, Modules, Solutions, and Operations that make up the wider platform.',
      primaryAction: {
        label: 'Open Project Console',
        to: '/console/project',
      },
      secondaryAction: {
        label: 'Browse modules',
        to: '/modules',
      },
    },
    panel: {
      title: 'What this page covers',
      subtitle: '',
      ticks: [
        'How Projects connect Apps and Ecosystems',
        'What the Project Console operates',
        'How Modules add reusable capability',
        'Where public platform records are published',
      ],
    },
    sections: {
      keyConceptsTitle: 'How FireUX is organised',
      modulesEyebrow: 'Modules',
      modulesTitle: 'What FireUX is built from',
      modulesDescription:
        'Core owns the shared runtime. Project surfaces and extension Modules add explicit capability.',
      entitiesEyebrow: 'Entities',
      entitiesTitle: 'The records FireUX connects',
      structureEyebrow: 'Structure',
      structureTitle: 'Relationship map',
      routesTitle: 'Key routes',
    },
    keyConcepts: [
      {
        title: 'Project',
        description: 'A Project is the control-plane record that connects its Apps and Ecosystem.',
      },
      {
        title: 'App',
        description: 'An App is a branded product surface connected to a Project and Ecosystem.',
      },
      {
        title: 'Ecosystem',
        description: 'An Ecosystem groups Apps around one product or domain and owns their shared configuration.',
      },
      {
        title: 'Module',
        description: 'A Module is reusable, source-controlled capability explicitly composed into an App.',
      },
      {
        title: 'User',
        description: 'A User has an identity and App-specific membership.',
      },
      {
        title: 'Console',
        description: 'A Console is the authenticated workspace for a selected Project, App, or Ecosystem.',
      },
      {
        title: 'Operation',
        description: 'An Operation names work performed inside a Console and links to its working route.',
      },
      {
        title: 'Solution',
        description: 'A Solution explains a proven FireUX capability in the language someone searches for.',
      },
      {
        title: 'Public directory',
        description: 'Public Apps and Ecosystems are safe projections of their canonical records.',
      },
    ],
    appSpec: {
      name: 'FireUX',
      tagline: 'The parent App for FireUX Projects and Ecosystems',
      description:
        'FireUX runs the Project Console and public catalogues used to request Apps through Ignition, review Project and Ecosystem relationships, and monitor new App users.',
      modules: [
        {
          name: 'FireUX Core',
          summary: 'Shared App shell, accounts, public directory components, and Console contracts.',
          entities: ['App', 'Ecosystem', 'User'],
        },
        {
          name: 'Project Console',
          summary: 'The Project workspace for Ignition, Apps, Ecosystem, and Users.',
          entities: ['Project', 'Ignition request', 'App', 'Ecosystem', 'User'],
        },
        {
          name: 'Public catalogues',
          summary: 'Public routes for Apps, Ecosystems, Modules, Solutions, and Operations.',
          entities: ['App directory entry', 'Ecosystem directory entry', 'Module package manifest'],
        },
        {
          name: 'Extension Modules',
          summary: 'Reusable domain capability explicitly composed into FireUX Apps.',
          entities: ['Module package manifest'],
        },
      ],
      entities: [
        {
          name: 'Project',
          purpose: 'Control-plane record for a FireUX Project.',
          keyFields: ['id', 'name', 'description', 'image'],
          linksTo: ['App', 'Ecosystem'],
        },
        {
          name: 'App',
          purpose: 'Canonical App identity connected to a Project and Ecosystem.',
          keyFields: ['id', 'name', 'project_id', 'ecosystem_id', 'role', 'status'],
          linksTo: ['Project', 'Ecosystem', 'User'],
        },
        {
          name: 'Ecosystem',
          purpose: 'Canonical Ecosystem identity grouping related Apps.',
          keyFields: ['id', 'name', 'project_id', 'slug', 'status'],
          linksTo: ['Project', 'App'],
        },
        {
          name: 'User',
          purpose: 'User identity with App-specific membership.',
          keyFields: ['id', 'display_name', 'handle', 'profiles'],
          linksTo: ['App'],
        },
        {
          name: 'Ignition request',
          purpose: 'A request to configure and launch an App.',
          keyFields: ['status', 'business', 'app_job', 'access', 'delivery'],
          linksTo: ['Project'],
        },
        {
          name: 'Module package manifest',
          purpose: 'Source-controlled package metadata used to compose App capability.',
          keyFields: ['type', 'id', 'name', 'team'],
          linksTo: ['App'],
        },
      ],
      routes: [
        { label: 'Home', path: '/', kind: 'public' },
        { label: 'Get Started', path: '/get-started', kind: 'public' },
        { label: 'Operations', path: '/operations', kind: 'public' },
        { label: 'Solutions', path: '/solutions', kind: 'public' },
        { label: 'Apps', path: '/apps', kind: 'public' },
        { label: 'Modules', path: '/modules', kind: 'public' },
        { label: 'Ecosystems', path: '/ecosystems', kind: 'public' },
        { label: 'Console Entry', path: '/console', kind: 'console' },
        { label: 'Project Console', path: '/console/project', kind: 'console' },
        { label: 'Project Ignition', path: '/console/project/ignitions', kind: 'console' },
        { label: 'Project Ecosystem', path: '/console/project/ecosystem', kind: 'console' },
        { label: 'Project Apps', path: '/console/project/apps', kind: 'console' },
        { label: 'Project Users', path: '/console/project/users', kind: 'console' },
      ],
    },
    relationshipMap: `
Project
  <- Ecosystem.project_id
  <- App.project_id

Ecosystem
  <- App.ecosystem_id

User
  -> App membership

Ignition request
  -> Project launch pipeline

Module package manifest
  -> App build and runtime composition
`,
    seo: {
      title: 'About FireUX',
      description:
        'How FireUX connects Projects, Apps, Ecosystems, Modules, Operations, Solutions, and users.',
    },
  },
  getStarted: {
    eyebrow: 'FireUX App',
    title: 'Ignition',
    description: fireuxOffer.ignition.description,
    setupPrice: '$150',
    monthlyPrice: '$15/month',
    included: [
      'Your branding',
      'Web app and installable PWA',
      'User accounts',
      'Operator console',
      'Hosting and deployment',
      'Pages and App features agreed before launch',
    ],
    requirements: [
      'Business name, logo, and colours',
      'What the app needs to do',
      'Who needs access',
    ],
    action: {
      label: 'Email instead',
      to: 'mailto:fire@fireux.app?subject=FireUX%20App%20Ignition',
    },
    seo: {
      title: 'FireUX App Ignition',
      description:
        'Request a FireUX App through Ignition. Setup is $150 and maintenance is $15 per month.',
    },
  },
  roadmap: {
    title: 'FireUX Road Map',
    summary:
      'Build out the Project Console one proven Operation at a time, then publish the matching Solutions and public records.',
  },
} as const
