export type KitchenIdentityToolHypothesis = {
  id: `kitchen.identity.${string}`
  label: string
  layer: 'human' | 'ai-assisted' | 'compound'
  purpose: string
  authority: string
  approval: string
  inputs: readonly string[]
  outputs: readonly string[]
  evidence: readonly string[]
  status: 'requested' | 'available'
}

export const kitchenIdentitySearchDemand = {
  observedAt: '2026-08-23',
  geography: 'English-language web',
  language: 'English',
  question:
    'What venue identity information do Kitchen operators need to maintain and publish?',
  method:
    'Current restaurant-profile and Local Business guidance establishes the information operators maintain. FireUX then assigns each field to Place or Kitchen authority rather than storing one convenient duplicate object.',
  seeds: [
    {
      seed: 'restaurant business profile',
      queries: [
        'restaurant profile management',
        'restaurant business information management',
        'manage restaurant listing',
      ],
    },
    {
      seed: 'restaurant location details',
      queries: [
        'update restaurant address hours phone',
        'restaurant location profile',
        'restaurant opening hours management',
      ],
    },
    {
      seed: 'restaurant publication',
      queries: [
        'publish restaurant online',
        'restaurant visibility settings',
        'restaurant menu business profile',
      ],
    },
  ],
  clusters: [
    {
      id: 'place',
      title: 'Maintain the real-world Place',
      operatorJob:
        'Maintain the venue name, address, coordinates, phone, website, hours and Place media used wherever that location appears.',
      authority: 'Place',
      interpretation:
        'A physical Kitchen resolves Place by the exact same document id. It does not copy a Place object or shadow these fields.',
    },
    {
      id: 'kitchen',
      title: 'Maintain the Kitchen root',
      operatorJob:
        'Maintain the Kitchen slug, lifecycle status and visibility that identify this Kitchen entity and its publication state.',
      authority: 'Kitchen',
      interpretation:
        'These are Kitchen fields. They do not absorb venue address, contact, hours, media, fulfilment or theme.',
    },
    {
      id: 'publish',
      title: 'Publish an honest projection',
      operatorJob:
        'Preview and publish the joined Kitchen and Place presentation with explicit visibility and missing-field evidence.',
      authority: 'Kitchen publication composed with Place',
      interpretation:
        'The projection may derive display fields for a page or directory; derived transport is not canonical storage.',
    },
  ],
  validationSources: [
    {
      label: 'Google Business Profile for restaurants',
      url: 'https://support.google.com/business/answer/14189260?hl=en',
      note: 'Validates restaurant address, phone, social links, hours, attributes, photos and menu information as maintained business-profile concerns.',
    },
    {
      label: 'Google Local Business structured data',
      url: 'https://developers.google.com/search/docs/appearance/structured-data/local-business',
      note: 'Validates Restaurant name, images, address, coordinates, telephone, cuisine, price range, hours and menu as a joined public presentation.',
    },
    {
      label: 'Google guidelines for representing a business',
      url: 'https://support.google.com/business/answer/3038177?hl=en',
      note: 'Validates accurate real-world name and separately maintained address, hours and category rather than keyword-loaded duplicate identity.',
    },
  ],
  records: [
    {
      id: 'kitchen.identity.kitchen',
      label: 'Kitchen',
      kind: 'owned',
      status: 'available',
      owner: 'Kitchen',
      authority:
        'Kitchen owns its identity, lifecycle, schedule and palette. The same id resolves its separate Place identity.',
      facts: [
        'stable id and identity source',
        'mutable slug',
        'status and visibility',
        'operating schedule',
        'appearance palette',
      ],
      readBy: [
        'kitchen.identity.update-kitchen',
        'kitchen.identity.update-hours',
        'kitchen.identity.update-appearance',
      ],
      writtenBy: [
        'kitchen.identity.update-kitchen',
        'kitchen.identity.update-hours',
        'kitchen.identity.update-appearance',
      ],
    },
    {
      id: 'kitchen.identity.place',
      label: 'Place',
      kind: 'reference',
      status: 'available',
      owner: 'Place',
      authority:
        'Place owns venue identity, location, contact, hours and media; Identity composes it without copying it into Kitchen.',
      facts: [
        'venue identity',
        'address and coordinates',
        'contact and hours',
        'Place media',
        'shared currency',
      ],
      readBy: [
        'kitchen.identity.update-place',
        'kitchen.identity.update-currency',
        'kitchen.identity.update-hours',
      ],
      writtenBy: [
        'kitchen.identity.update-place',
        'kitchen.identity.update-currency',
        'kitchen.identity.update-hours',
      ],
    },
  ],
  recordQuestions: [
    'Which Kitchen id and Place id are being composed?',
    'Which entity owns every editable field?',
    'Does the operator have authority to edit Kitchen, Place or both?',
    'Is a displayed value canonical, joined, derived or missing?',
    'Is the fixed same-id Place present, and are its public details accurate?',
    'Which visibility or lifecycle change is being proposed and what will it expose?',
    'Which fields are required for this publication target rather than globally required?',
    'Can previews and debug output preserve the visible Kitchen and Place separation?',
  ],
  toolHypotheses: [
    {
      id: 'kitchen.identity.update-kitchen',
      label: 'Show or hide Kitchen in directory',
      layer: 'human',
      purpose:
        'Change Kitchen directory visibility through the existing publication switch; Menu publication and ordering are independent.',
      authority:
        'Kitchen root only; the mounted Identity control changes directory visibility. The update command also accepts slug/status, without a dedicated Identity form for them.',
      approval: 'Every write requires explicit operator submission.',
      inputs: ['Selected Kitchen and desired directory visibility'],
      outputs: ['Kitchen directory visibility updated; other fields unchanged'],
      evidence: [
        'kitchen/components/Edit/Publication.vue',
        'kitchen/server/identity/update.ts',
      ],
      status: 'available',
    },
    {
      id: 'kitchen.identity.update-place',
      label: 'Edit venue details',
      layer: 'compound',
      purpose:
        'Route Place-owned identity changes to the canonical Place action without copying them into Kitchen.',
      authority:
        'Place owns the mutation; Identity only composes the doorway and context.',
      approval: 'Explicit approval and Place write authority are required.',
      inputs: [
        'Selected Kitchen, same-id Place and reviewed venue field changes',
      ],
      outputs: [
        'Canonical Place fields updated; Kitchen identity remains separate',
      ],
      evidence: [
        'kitchen/components/Workspace/Identity/Index.vue',
        'fireux-places/runtime/place/components/Edit.vue',
      ],
      status: 'available',
    },
    {
      id: 'kitchen.identity.update-currency',
      label: 'Set venue currency',
      layer: 'human',
      purpose:
        'Edit the shared Place currency through its existing editor; Kitchen pricing reads that same Place value.',
      authority:
        'Place update command checks current App membership and the exact Kitchen/Place mutation authority.',
      approval: 'The operator explicitly saves the currency.',
      inputs: ['Selected Kitchen and three-letter operating currency'],
      outputs: ['Shared Place currency updated'],
      evidence: [
        'fireux-places/runtime/place/components/Edit/Visit.vue',
        'fireux-places/runtime/place/server/identity/update.ts',
      ],
      status: 'available',
    },
    {
      id: 'kitchen.identity.update-hours',
      label: 'Manage operating hours',
      layer: 'human',
      purpose:
        'Maintain venue opening hours and the separate Kitchen operating schedule on the Operating hours page.',
      authority:
        'Place owns venue hours; Kitchen owns its operating schedule. Offering hours remain separate.',
      approval: 'The operator explicitly saves each schedule.',
      inputs: [
        'Selected Kitchen and explicitly reviewed venue or operating schedule',
      ],
      outputs: [
        'Only the submitted owner schedule changes; offering schedules stay separate',
      ],
      evidence: [
        'kitchen/components/Workspace/OperatingHours/Index.vue',
        'kitchen/server/ordering/hours.ts',
      ],
      status: 'available',
    },
    {
      id: 'kitchen.identity.update-appearance',
      label: 'Manage appearance',
      layer: 'human',
      purpose:
        'Set the Kitchen palette on its Appearance page. Venue branding and Menu presentation keep their own owners.',
      authority:
        'Kitchen owns its palette; Workspace is a presentation surface.',
      approval: 'The operator explicitly saves the palette.',
      inputs: ['Selected Kitchen and reviewed four-colour palette'],
      outputs: [
        'Kitchen palette updated; venue branding and Menu presentation stay separate',
      ],
      evidence: [
        'kitchen/components/Workspace/Appearance/Index.vue',
        'kitchen/server/identity/theme.ts',
      ],
      status: 'available',
    },
  ] satisfies KitchenIdentityToolHypothesis[],
  aiContract: {
    identityAI: [
      'Explain the Kitchen and Place boundary before proposing a change.',
      'Read canonical Kitchen and authorized Place context without flattening the join.',
      'Identify missing, conflicting and derived values explicitly.',
      'Propose only owner-correct actions and never mutate without approval.',
    ],
    kitchenAI: [
      'Recognise Kitchen identity and publication intent and delegate it to KitchenIdentityAI.',
      'Pass selected Kitchen, linked Place and authorization context.',
      'Keep operational capability configuration outside Identity.',
    ],
    activation: [
      'Canonical Kitchen and Place update commands exist with explicit ownership.',
      'The same-id Place relationship is fixed at creation; Identity does not expose relinking.',
      'Joined readers preserve Kitchen, Place and derived presentation separation.',
      'Available means an implemented human control; it does not imply a registered agent-callable tool or live acceptance proof.',
    ],
  },
  currentDrift: [],
  conclusion:
    'Kitchen Identity is a joined editing surface over two explicit authorities: Kitchen and Place. It must preserve that separation in storage, UI, debug, AI context and every proposed mutation.',
} as const
