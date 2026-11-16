export const getStartedContent = {
  hero: {
    eyebrow: 'Start with one Kitchen',
    title: 'Start your Kitchen without signing up',
    description:
      'Start a Kitchen and explore its Workspace tools. Sign in to save your Kitchen. Free includes one combined Food & Drinks menu. Upgrade to Pro or Business for unlimited menus.',
    primaryAction: {
      label: 'Start one Kitchen',
    },
    secondaryAction: {
      label: 'Open Kitchen Workspace',
      to: '/workspace/kitchen',
    },
  },
  snapshotTitle: 'What the setup connects',
  snapshotTicks: [
    'Kitchen identity and operator access',
    'Menus, dishes, recipes, ingredients, and allergens',
    'Prep work organised around stations and service',
    'Guest orders carried into a clear Kitchen handoff',
  ],
  stepsHeading: {
    eyebrow: 'Three steps',
    title: 'A practical rollout in three steps',
    description:
      'Start with Kitchen truth, connect the work behind the menu, then run a service flow your team can inspect and improve.',
  },
  steps: [
    {
      badge: 'Step 1',
      title: 'Establish the Kitchen',
      copy: 'Create the Kitchen identity, attach the right operators, and decide which existing information is worth carrying forward.',
      items: [
        'Kitchen identity',
        'Operator access',
        'Current menu and source inventory',
      ],
    },
    {
      badge: 'Step 2',
      title: 'Connect the menu to prep',
      copy: 'Structure menus, dishes, recipes, ingredients, and station work so one change does not have to be copied between tools.',
      items: [
        'Menu and dish structure',
        'Recipes and ingredient relationships',
        'Prep and station workflow',
      ],
    },
    {
      badge: 'Step 3',
      title: 'Run and review service',
      copy: 'Carry guest choices into the Kitchen queue, move tickets toward handoff, and keep the underlying menu information current.',
      items: [
        'Order flow check',
        'Kitchen handoff review',
        'Next-service improvement list',
      ],
    },
  ],
  afterSetup: {
    title: 'What happens after setup starts',
    faqs: [
      {
        title: 'Data migration',
        copy: 'Import from spreadsheets, exports, or Firestore sources. Data is normalized before production use.',
      },
      {
        title: 'Role and access control',
        copy: 'Use explicit Kitchen access with clear responsibility boundaries for owners, operators, and team members.',
      },
      {
        title: 'Subscriptions and app extension',
        copy: 'Start with the right subscription tier, then move into a custom app build when your operating model is ready to extend.',
      },
      {
        title: 'Phased rollout',
        copy: 'Launch one Kitchen first, validate the menu-to-service workflow, then scale location by location using the same operating template.',
      },
    ],
    card: {
      eyebrow: 'Need a faster launch?',
      title:
        'Use express rollout when you need one operating model across multiple kitchens with minimal drift.',
      bullets: [
        'Daily implementation checkpoints.',
        'Menu and workflow mapping in parallel.',
        'Team enablement for prep and service.',
      ],
      action: {
        label: 'See what works today',
        to: '/operations',
      },
    },
  },
  seo: {
    title: 'Get Started · Misebox',
    description:
      'Create a Kitchen workspace and connect menus, dishes, recipes, prep work, orders, and service handoff.',
  },
} as const
