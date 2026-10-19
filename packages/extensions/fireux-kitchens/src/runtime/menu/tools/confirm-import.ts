import { defineFireuxDomainTool } from 'fireux-core/runtime/tools/types'

export const kitchenMenuConfirmImportTool = defineFireuxDomainTool({
  kind: 'domain-tool',
  id: 'kitchen.menus.confirm-import',
  family: 'kitchen.menus',
  name: 'Confirm a menu import',
  description:
    'Create the reviewed Menu and Dish data at the explicit import commit point.',
  problem:
    'An authorized operator needs to approve a reviewed menu draft before it changes Kitchen data.',
  searchIntents: [
    {
      phrase: 'approve digital menu import',
      kind: 'solution',
      status: 'hypothesis',
    },
    {
      phrase: 'create dishes from menu PDF',
      kind: 'problem',
      status: 'hypothesis',
    },
    {
      phrase: 'restaurant menu import workflow',
      kind: 'product',
      status: 'hypothesis',
    },
  ],
  input: {
    required: ['appId', 'kitchenId', 'menuId', 'uploadId', 'name', 'confirmDishes'],
    extensible: false,
  },
  result: { kind: 'KitchenMenuImportCommit' },
  execution: {
    environment: 'server',
    authorization: 'required',
    confirmation: 'required',
  },
  surfaces: { human: true, ai: false },
  ai: {
    baked: {
      purpose: 'Commit an authorized, reviewed Kitchen Menu import.',
      knows: [
        'The selected Kitchen, reviewed draft, comparison and media decisions.',
      ],
      constraints: [
        'Do not commit without explicit human confirmation.',
        'Do not commit unresolved media decisions, duplicate options or destructive option loss.',
      ],
      evidence: ['Return the created or updated Menu and Dish write outcome.'],
    },
    runtime: {
      accepted: false,
      required: [
        'workspaceSelection',
        'reviewedMenuDraft',
        'humanConfirmation',
      ],
      optional: ['currentMenu', 'mediaDecisions', 'userRequest'],
    },
  },
  implementation: {
    references: [
      'fireux-kitchens/runtime/server/api/workspace/kitchen/menus/confirm.post',
      'fireux-kitchens/runtime/menu/server/draft/write',
    ],
  },
  documentation: {
    slug: 'confirm-menu-import',
    guide:
      'Use only after reviewing the generated draft and its media decisions. This is the explicit commit point that writes Menu and Dish data.',
  },
})
