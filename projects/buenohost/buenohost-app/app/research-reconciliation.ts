import type { AppSearchDemand } from 'fireux-core/config/app/search-demand'

export const researchReconciliation = {
  first_journey: {
    title: 'Booked stay to useful arrival information',
    purpose:
      'Let a host prepare arrival information for one Property and deliver the appropriate information to its booked guest.',
    capability_ids: ['guest-guide', 'reservations'],
    pages: [
      {
        label: 'Reservations',
        path: '/workspace/property/reservations',
        availability: 'enabled',
      },
      {
        label: 'Arrival guide',
        path: '/workspace/property/arrival',
        availability: 'planned',
      },
    ],
    tools: [
      {
        label: 'Create and update a reservation',
        status: 'connected',
        owner: 'Property / Reservations',
        source_paths: [
          'packages/extensions/fireux-reservations/src/runtime/property/components/Workspace/Reservations/Create.vue',
        ],
      },
      {
        label: 'Review and publish arrival guide; open it as the booked guest',
        status: 'planned',
        owner: 'Property',
        source_paths: [],
      },
    ],
    services: [
      {
        label: 'Validate reservation and allocate its nights',
        status: 'connected',
        owner: 'Property / Reservations',
        source_paths: [
          'packages/extensions/fireux-reservations/src/runtime/property/server/reservations/command.ts',
        ],
      },
      {
        label: 'Publish arrival information and authorise guest delivery',
        status: 'planned',
        owner: 'Property',
        source_paths: [],
      },
    ],
    acceptance: [
      'Arrival information belongs to the selected Property and is reviewed by its host.',
      'The intended guest can access information for their stay without exposing private host notes or unrelated reservations.',
      'Changed or cancelled stays revoke inappropriate access; edits retain a clear publication outcome.',
    ],
    gaps: [
      'The arrival-guide authoring, publication and guest delivery workflow is not implemented.',
      'Existing reservation notes are private host context, not a guest-facing guide.',
    ],
    checks: [
      'packages/extensions/fireux-reservations/src/test/reservation-command.test.mjs',
    ],
  },
  workspace: 'Property',
  reviewed_at: '2026-10-05',
  summary:
    'Retain Reservation authority and its Calendar. The first product proof is a host publishing appropriate arrival information for one booked stay, followed by guest use; turnover and communication remain distinct hypotheses.',
  foundations: [
    'Home and selection, Overview, Identity and Team are shared responsibilities with domain-owned access.',
    'Calendar and AI availability need their own connected sources; a page is not proof of a workflow.',
    'Test is a development surface. Industry research does not change operator access.',
  ],
  entries: [
    {
      id: 'reservations',
      title: 'Reservations',
      action: 'improve',
      status: 'connected',
      rationale:
        'Preserve booked-stay identity and allocation. Do not equate imported calendars with atomic multi-channel booking protection.',
      source_paths: [
        'packages/extensions/fireux-reservations/src/runtime/pages/workspace/property/reservations/index.vue',
      ],
      source_capability_ids: ['reservations'],
      source_observation_ids: ['channel-sync'],
    },
    {
      id: 'calendar',
      title: 'Reservation Calendar',
      action: 'keep',
      status: 'connected',
      rationale:
        'Keep the installed Reservations Calendar over the same owning records. The base Property placeholder is not the active BuenoHost integration.',
      source_paths: [
        'packages/extensions/fireux-reservations/src/runtime/pages/workspace/property/calendar.vue',
      ],
      source_capability_ids: ['reservations', 'turnover'],
      source_observation_ids: ['channel-sync', 'turnover'],
    },
  ],
} satisfies NonNullable<AppSearchDemand['reconciliation']>
