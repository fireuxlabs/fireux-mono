import type {
  IgnitionAssembly,
  IgnitionBrief,
} from 'fireux-ignite/runtime/models/ignition'
export const collectionOrderingBrief: IgnitionBrief = {
  id: 'collection-ordering',
  industry: 'Food service',
  outcome:
    'Let a food operator publish a menu, accept collection orders and hand prepared food to customers.',
  actors: ['Operator', 'Customer', 'Kitchen team'],
  requirements: [
    {
      id: 'venue',
      need: 'Manage the venue identity without mixing it with operational configuration.',
      acceptance:
        'An authorised operator edits the venue profile and sees the same identity on customer surfaces.',
    },
    {
      id: 'menu',
      need: 'Publish a menu with items, prices and availability.',
      acceptance: 'Customers can read the reviewed, currently published menu.',
    },
    {
      id: 'configuration',
      need: 'Configure collection hours and accepted payment methods.',
      acceptance:
        'Ordering uses the selected venue’s saved policies and rejects unavailable choices.',
    },
    {
      id: 'place-order',
      need: 'Create a collection order from the chosen menu.',
      acceptance:
        'The customer receives an order reference and the correct operator receives that order exactly once.',
    },
    {
      id: 'fulfil',
      need: 'Accept, prepare and complete the order.',
      acceptance:
        'The operator takes the same order through preparation and pickup, with failures and account changes handled safely.',
    },
  ],
}
const source = 'packages/extensions/fireux-kitchens/src/runtime/'
export const miseboxReference: IgnitionAssembly = {
  id: 'misebox-collection-reference',
  elements: [
    {
      id: 'kitchen',
      role: 'entity',
      owner: 'fireux-kitchens',
      requirements: ['venue'],
      uses: [],
      sourcePaths: [source + 'kitchen/models/kitchen.model.ts'],
    },
    {
      id: 'workspace',
      role: 'workspace',
      owner: 'fireux-kitchens',
      requirements: ['venue', 'fulfil'],
      uses: ['kitchen'],
      sourcePaths: [source + 'kitchen/components/Workspace/Navigation.vue'],
    },
    {
      id: 'identity',
      role: 'capability',
      owner: 'fireux-kitchens → fireux-places',
      requirements: ['venue'],
      uses: ['kitchen'],
      sourcePaths: [
        source + 'kitchen/components/Workspace/Identity/Profile.vue',
      ],
    },
    {
      id: 'menus',
      role: 'capability',
      owner: 'fireux-kitchens',
      requirements: ['menu'],
      uses: ['kitchen'],
      sourcePaths: [source + 'kitchen/components/Workspace/Menus/Index.vue'],
    },
    {
      id: 'offerings',
      role: 'capability',
      owner: 'fireux-kitchens',
      requirements: ['configuration'],
      uses: ['kitchen', 'menus'],
      sourcePaths: [
        source + 'kitchen/components/Workspace/Offerings/Index.vue',
        source + 'kitchen/components/Workspace/Fulfilment/Index.vue',
      ],
    },
    {
      id: 'ordering',
      role: 'service',
      owner: 'fireux-kitchens',
      requirements: ['place-order'],
      uses: ['menus', 'offerings'],
      sourcePaths: [
        source + 'kitchen/components/Ordering/Setup.vue',
        source + 'menu/server/ordering/create.ts',
      ],
    },
    {
      id: 'customer-menu',
      role: 'surface',
      owner: 'fireux-kitchens',
      requirements: ['menu', 'place-order'],
      uses: ['ordering'],
      sourcePaths: [source + 'menu/components/Order/Index.vue'],
    },
    {
      id: 'orders',
      role: 'capability',
      owner: 'fireux-kitchens',
      requirements: ['fulfil'],
      uses: ['kitchen'],
      sourcePaths: [
        source +
          'kitchen/composables/workspace/orders/useKitchenWorkspaceOrders.ts',
      ],
    },
    {
      id: 'order-actions',
      role: 'tool',
      owner: 'fireux-kitchens',
      requirements: ['fulfil'],
      uses: ['orders'],
      sourcePaths: [
        source + 'kitchen/composables/orders/useKitchenOrderTransition.ts',
      ],
    },
    {
      id: 'order-board',
      role: 'surface',
      owner: 'fireux-kitchens',
      requirements: ['fulfil'],
      uses: ['orders', 'order-actions', 'workspace'],
      sourcePaths: [source + 'kitchen/components/Workspace/Orders/Index.vue'],
    },
  ],
  evidence: collectionOrderingBrief.requirements.map((requirement) => ({
    requirement: requirement.id,
    level: 'source-reviewed',
    observation:
      'Reference implementation exists; this record does not claim an independently generated or fully accepted customer-to-pickup journey.',
    references: ['projects/misebox/misebox-app/app/search-demand.ts'],
  })),
  learnings: [
    {
      decision: 'Separate capability ownership from storage nesting.',
      reason:
        'Small configuration and separately managed records have different lifetimes; neither UI nesting nor a service should take over their owners.',
      owner: 'Domain contracts',
      references: ['docs/concepts/family-workspace-capability-tool.md'],
    },
    {
      decision:
        'Keep operating views local to one board; put occasional configuration in its owning offering.',
      reason:
        'Queue, pass and pre-orders are perspectives on shared orders. Table-count setup belongs with dine-in rather than a daily-work destination.',
      owner: 'Domain presentation',
      references: [
        source + 'pages/workspace/kitchen/orders/index.vue',
        source + 'kitchen/components/Workspace/Offerings/Index.vue',
      ],
    },
    {
      decision:
        'Keep business briefs independent from the reference implementation.',
      reason:
        'Hand-building the proof product does not establish that Ignition can recreate it.',
      owner: 'fireux-ignite',
      references: [
        'packages/extensions/fireux-ignite/src/runtime/utils/ignition-method.ts',
      ],
    },
  ],
}
