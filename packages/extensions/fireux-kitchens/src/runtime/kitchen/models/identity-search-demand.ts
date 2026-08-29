export type KitchenIdentityToolHypothesis = {
  id: `kitchen.identity.${string}`
  label: string
  layer: 'human' | 'ai-assisted' | 'compound'
  purpose: string
  authority: string
  approval: string
  status: 'requested'
}

export const kitchenIdentitySearchDemand = {
  observedAt: '2026-08-23',
  geography: 'English-language web',
  language: 'English',
  question: 'What venue identity information do Kitchen operators need to maintain and publish?',
  method:
    'Current restaurant-profile and Local Business guidance establishes the information operators maintain. FireUX then assigns each field to Place or Kitchen authority rather than storing one convenient duplicate object.',
  seeds: [
    {
      seed: 'restaurant business profile',
      queries: ['restaurant profile management', 'restaurant business information management', 'manage restaurant listing'],
    },
    {
      seed: 'restaurant location details',
      queries: ['update restaurant address hours phone', 'restaurant location profile', 'restaurant opening hours management'],
    },
    {
      seed: 'restaurant publication',
      queries: ['publish restaurant online', 'restaurant visibility settings', 'restaurant menu business profile'],
    },
  ],
  clusters: [
    {
      id: 'place',
      title: 'Maintain the real-world Place',
      operatorJob: 'Maintain the venue name, address, coordinates, phone, website, hours and Place media used wherever that location appears.',
      authority: 'Place',
      interpretation: 'A physical Kitchen resolves Place by the exact same document id. It does not copy a Place object or shadow these fields.',
    },
    {
      id: 'kitchen',
      title: 'Maintain the Kitchen root',
      operatorJob: 'Maintain the Kitchen slug, lifecycle status and visibility that identify this Kitchen entity and its publication state.',
      authority: 'Kitchen',
      interpretation: 'These are Kitchen fields. They do not absorb venue address, contact, hours, media, fulfilment or theme.',
    },
    {
      id: 'link',
      title: 'Link the correct authorities',
      operatorJob: 'Create, select or replace the Place linked to the Kitchen while preserving both entity identities and permissions.',
      authority: 'Kitchen link plus Place authority',
      interpretation: 'Relinking is a consequential compound action. It must not clone one Place into Kitchen or silently rewrite a shared Place.',
    },
    {
      id: 'publish',
      title: 'Publish an honest projection',
      operatorJob: 'Preview and publish the joined Kitchen and Place presentation with explicit visibility and missing-field evidence.',
      authority: 'Kitchen publication composed with Place',
      interpretation: 'The projection may derive display fields for a page or directory; derived transport is not canonical storage.',
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
    authority: 'Kitchen owns only its domain root identity and lifecycle; the same id resolves Place identity when the Kitchen is physical.',
    facts: [ 'id and slug', 'status and visibility' ],
    readBy: [ 'kitchen.identity.update-kitchen', 'kitchen.identity.link-place' ],
    writtenBy: [ 'kitchen.identity.update-kitchen', 'kitchen.identity.link-place' ]
  },
  {
    id: 'kitchen.identity.place',
    label: 'Place',
    kind: 'reference',
    status: 'available',
    owner: 'Place',
    authority: 'Place owns venue identity, location, contact, hours and media; Identity composes it without copying it into Kitchen.',
    facts: [ 'venue identity', 'address and coordinates', 'contact and hours', 'Place media' ],
    readBy: [ 'kitchen.identity.update-place', 'kitchen.identity.link-place' ],
    writtenBy: [ 'kitchen.identity.update-place' ]
  }
],
  recordQuestions: [
    'Which Kitchen id and Place id are being composed?',
    'Which entity owns every editable field?',
    'Does the operator have authority to edit Kitchen, Place or both?',
    'Is a displayed value canonical, joined, derived or missing?',
    'Would changing the linked Place affect another Kitchen, Supplier or public surface?',
    'Which visibility or lifecycle change is being proposed and what will it expose?',
    'Which fields are required for this publication target rather than globally required?',
    'Can previews and debug output preserve the visible Kitchen and Place separation?',
  ],
  toolHypotheses: [
    {
      id: 'kitchen.identity.update-kitchen',
      label: 'Update Kitchen Identity',
      layer: 'human',
      purpose: 'Update canonical Kitchen-owned slug, status or visibility through one validated mutation.',
      authority: 'Kitchen root only; Place and presentation projections are excluded.',
      approval: 'Every write requires explicit operator submission.',
      status: 'requested',
    },
    {
      id: 'kitchen.identity.update-place',
      label: 'Update Linked Place',
      layer: 'compound',
      purpose: 'Route Place-owned identity changes to the canonical Place action without copying them into Kitchen.',
      authority: 'Place owns the mutation; Identity only composes the doorway and context.',
      approval: 'Explicit approval and Place write authority are required.',
      status: 'requested',
    },
    {
      id: 'kitchen.identity.link-place',
      label: 'Link Kitchen to Place',
      layer: 'compound',
      purpose: 'Create, select or replace the canonical Place link with collision and shared-use checks.',
      authority: 'The exact Kitchen id resolves the independent same-id Place; the operation must not store a second relationship id.',
      approval: 'Explicit confirmation is required because relinking changes joined identity across surfaces.',
      status: 'requested',
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
      'Place-link replacement defines collision, shared-use and authorization behaviour.',
      'Joined readers preserve Kitchen, Place and derived presentation separation.',
      'Tools are registered, authorized and verified end to end.',
    ],
  },
  currentDrift: [
    'The current Identity progression includes a Workspace theme stage. Workspace does not own a theme, so that stage is outside the canonical Identity boundary and requires a separate bounded removal or re-home pass.',
    'Existing human forms and mutations are not automatically AI-callable Tools; the three specifications remain requested until registered and verified.',
  ],
  conclusion:
    'Kitchen Identity is a joined editing surface over two explicit authorities: Kitchen and Place. It must preserve that separation in storage, UI, debug, AI context and every proposed mutation.',
} as const
