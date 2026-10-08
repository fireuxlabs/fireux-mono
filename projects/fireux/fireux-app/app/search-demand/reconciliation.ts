import type { AppSearchDemand } from 'fireux-core/config/app/search-demand'

export const projectReconciliation = {
  first_journey: {
    title: 'Project brief to an owned App preview',
    purpose:
      'Give a creator one concrete product brief and an App they can inspect within the selected Project.',
    capability_ids: ['industry-brief', 'app-building'],
    pages: [
      {
        label: 'Project Apps',
        path: '/workspace/project/apps',
        availability: 'enabled',
      },
    ],
    tools: [
      {
        label: 'Create App and preview',
        status: 'connected',
        owner: 'Project',
        source_paths: [
          'packages/ecosystem/fireux-fireux/src/runtime/project/components/Workspace/Apps/Create.vue',
        ],
      },
      {
        label: 'Capture a structured industry brief',
        status: 'planned',
        owner: 'Project',
        source_paths: [],
      },
    ],
    services: [
      {
        label: 'Create inactive App and initial ownership',
        status: 'connected',
        owner: 'FireUX App',
        source_paths: [
          'packages/ecosystem/fireux-fireux/src/runtime/project/server/apps/create.ts',
        ],
      },
    ],
    acceptance: [
      'Create one App for the selected Project and declared Ecosystem; its saved identity and HTML preview match the submission.',
      'Changing account or Project before dispatch cannot retarget the creation; an obsolete completion cannot navigate or display success in the new context.',
      'A structured brief can be traced to the chosen capabilities before claiming brief-to-App generation.',
    ],
    gaps: [
      'The structured brief-to-App handoff is not implemented.',
      'The preview is not provisioning, deployment, monetisation or an AI-generated SaaS.',
    ],
    checks: [],
  },
  workspace: 'Project',
  reviewed_at: '2026-10-05',
  summary:
    'Focus Project on igniting and organising an industry SaaS product. Keep Apps and Ecosystem as distinct ownership views. An App record is not a generated, deployed or monetised product.',
  foundations: [
    'Home and selection, Overview, Identity and Team are shared responsibilities with domain-owned access.',
    'Calendar and AI availability need their own connected sources; a page is not proof of a workflow.',
    'Test is a development surface. Industry research does not change operator access.',
    'FireUX App admin Ignition intake is adjacent; its route does not make it a Project-owned capability.',
  ],
  entries: [
    {
      id: 'apps',
      title: 'Apps',
      action: 'improve',
      status: 'partial',
      rationale:
        'Keep App creation and directory links; validate brief-to-working-App, branding and reuse before claiming SaaS generation.',
      source_paths: [
        'packages/ecosystem/fireux-fireux/src/runtime/project/components/Workspace/Apps/Index.vue',
      ],
      source_capability_ids: ['app-building', 'industry-brief'],
      source_observation_ids: ['project-generation', 'project-ownership'],
    },
    {
      id: 'ecosystem',
      title: 'Ecosystem',
      action: 'improve',
      status: 'partial',
      rationale:
        'Keep connected product-family discovery; define shared-versus-isolated data, membership and reuse explicitly before offering ecosystem provisioning.',
      source_paths: [
        'packages/ecosystem/fireux-fireux/src/runtime/project/components/Workspace/Ecosystem/Index.vue',
      ],
      source_capability_ids: ['ecosystem-composition'],
      source_observation_ids: ['project-remix', 'project-authority'],
    },
  ],
} satisfies NonNullable<AppSearchDemand['reconciliation']>
