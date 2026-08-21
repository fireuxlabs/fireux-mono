import { defineFireuxDomainTool } from 'fireux-core/runtime/tools/types'

export const kitchenMenuReviewImportDraftTool = defineFireuxDomainTool({
  kind: 'domain-tool',
  id: 'kitchen.menus.review-import-draft',
  family: 'kitchen.menus',
  name: 'Review a menu import',
  description:
    'Convert a stored menu source into a normalized draft and compare it with the current Kitchen menu.',
  problem:
    'Extracted menu information needs a safe, understandable review before it changes Kitchen data.',
  searchIntents: [
    {
      phrase: 'review AI menu extraction',
      kind: 'solution',
      status: 'hypothesis',
    },
    {
      phrase: 'check menu PDF conversion',
      kind: 'problem',
      status: 'hypothesis',
    },
    {
      phrase: 'restaurant menu import preview',
      kind: 'product',
      status: 'hypothesis',
    },
  ],
  input: {
    required: ['appId', 'kitchenId', 'menuId', 'uploadId', 'confirmBilling'],
    extensible: true,
  },
  result: { kind: 'KitchenMenuImportReview' },
  execution: {
    environment: 'server',
    authorization: 'required',
    confirmation: 'required',
  },
  surfaces: { human: true, ai: true },
  ai: {
    baked: {
      purpose:
        'Prepare a reviewable Kitchen Menu draft from authorized sources.',
      knows: [
        'The selected Kitchen, stored menu sources, currency and current Menu shape.',
      ],
      constraints: [
        'Do not invent dishes, prices, images or translations.',
        'Do not write Menu or Dish records; save only the review draft.',
        'Do not process without explicit billing confirmation.',
      ],
      evidence: [
        'Return per-file outcomes, extracted and normalized sections, comparison flags and cost evidence.',
      ],
    },
    runtime: {
      accepted: true,
      required: ['workspaceSelection', 'menuSource', 'currencyCode'],
      optional: ['currentMenu', 'quality', 'fileLimit', 'userRequest'],
    },
  },
  implementation: {
    references: [
      'fireux-kitchens/runtime/server/api/workspace/kitchen/menus/process.post',
      'fireux-kitchens/runtime/menu/server/ai/review',
    ],
  },
  documentation: {
    slug: 'review-menu-import',
    guide:
      'Use after a source upload. The tool records per-file outcomes, normalizes the extracted sections, compares them with current data and saves only a review draft.',
  },
})
