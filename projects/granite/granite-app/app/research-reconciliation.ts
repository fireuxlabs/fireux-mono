import type { AppSearchDemand } from 'fireux-core/config/app/search-demand'

export const researchReconciliation = {
  first_journey: {
    title: 'Property issue to accountable closure',
    purpose:
      'Let a Portfolio operator follow one property issue from recording through responsibility and completion evidence.',
    capability_ids: ['maintenance', 'documents'],
    pages: [
      {
        label: 'Tasks',
        path: '/workspace/portfolio/tasks',
        availability: 'enabled',
      },
      {
        label: 'Documents',
        path: '/workspace/portfolio/documents',
        availability: 'enabled',
      },
    ],
    tools: [
      {
        label: 'Create task and change status',
        status: 'connected',
        owner: 'Portfolio / Tasks',
        source_paths: [
          'packages/extensions/fireux-tasks/src/runtime/pages/workspace/portfolio/tasks.vue',
        ],
      },
      {
        label:
          'Link the affected Property, assign responsibility and record closure evidence',
        status: 'planned',
        owner: 'Portfolio / Tasks',
        source_paths: [],
      },
    ],
    services: [
      {
        label: 'Create and update Portfolio-owned tasks',
        status: 'connected',
        owner: 'Portfolio / Tasks',
        source_paths: [
          'packages/extensions/fireux-tasks/src/runtime/portfolio/server/tasks/commands.ts',
        ],
      },
      {
        label: 'Validate assignee, property relationship and closure evidence',
        status: 'planned',
        owner: 'Portfolio / Tasks',
        source_paths: [],
      },
    ],
    acceptance: [
      'An issue names the correct Property within the selected Portfolio.',
      'An authorised assignee and due date are visible; switching Portfolio or account cannot retarget a pending action.',
      'Closure retains what was done and its linked evidence, with an explicit result visible to the operator.',
    ],
    gaps: [
      'Current task controls support title, description, due date and status, but do not prove assignment or maintenance closure evidence.',
      'Documents remain a separate evidence owner; task status alone is not proof of repair.',
    ],
    checks: [],
  },
  workspace: 'Portfolio',
  reviewed_at: '2026-10-05',
  summary:
    'Keep property-linked Tasks, Documents and Compliance. Prove one issue through assignment, evidence and closure before adding rental accounting or borrowing the hospitality booking lifecycle.',
  foundations: [
    'Home and selection, Overview, Identity and Team are shared responsibilities with domain-owned access.',
    'Calendar and AI availability need their own connected sources; a page is not proof of a workflow.',
    'Test is a development surface. Industry research does not change operator access.',
  ],
  entries: [
    {
      id: 'properties',
      title: 'Properties',
      action: 'improve',
      status: 'partial',
      rationale:
        'Prove property/unit identity and Portfolio links; the read surface is not the full acquisition, lease or occupancy lifecycle.',
      source_paths: [
        'packages/extensions/fireux-properties/src/runtime/portfolio/components/Workspace/Properties/Index.vue',
      ],
      source_capability_ids: ['properties'],
      source_observation_ids: ['manager-work'],
    },
    {
      id: 'tasks',
      title: 'Tasks',
      action: 'improve',
      status: 'partial',
      rationale:
        'Use existing tasks to prove a property issue with responsibility and closure; a generic task alone does not prove maintenance service delivery.',
      source_paths: [
        'packages/extensions/fireux-tasks/src/runtime/pages/workspace/portfolio/tasks.vue',
      ],
      source_capability_ids: ['maintenance'],
      source_observation_ids: ['manager-work', 'resident-requests'],
    },
    {
      id: 'documents',
      title: 'Documents',
      action: 'keep',
      status: 'connected',
      rationale:
        'Retain uploads and linked evidence; validate disclosure and retention needs rather than claiming a signature or legal archive.',
      source_paths: [
        'packages/extensions/fireux-documents/src/runtime/pages/workspace/portfolio/documents.vue',
      ],
      source_capability_ids: ['documents'],
      source_observation_ids: ['portfolio-workflows'],
    },
    {
      id: 'compliance',
      title: 'Compliance',
      action: 'improve',
      status: 'partial',
      rationale:
        'Keep the record and follow-up surface; establish jurisdiction-specific requirements and provenance before making compliance claims.',
      source_paths: [
        'packages/extensions/fireux-compliance/src/runtime/pages/workspace/portfolio/compliance.vue',
      ],
      source_capability_ids: ['obligations'],
      source_observation_ids: ['manager-work', 'tenancy-jurisdiction'],
    },
    {
      id: 'finance',
      title: 'Finance',
      action: 'defer',
      status: 'not-connected',
      rationale:
        'The page is parked. Define rent, payment and expense producers before reports.',
      source_paths: [
        'packages/extensions/fireux-properties/src/runtime/pages/workspace/portfolio/finance.vue',
      ],
      source_capability_ids: ['finance'],
      source_observation_ids: ['portfolio-workflows'],
    },
  ],
} satisfies NonNullable<AppSearchDemand['reconciliation']>
