import type { AppSearchDemand } from 'fireux-core/config/app/search-demand'

const capabilityCandidates = {
  summary:
    'This is an opportunity order, not a released Project Workspace catalogue. Industry briefing is the first FireUX-specific hypothesis; owned App creation, ecosystem reuse and release require distinct product proofs.',
  capabilities: [
    {
      id: 'industry-brief',
      definition: {
        purpose:
          'Turn an industry and operator need into a sourced, bounded product brief.',
        manages: [
          'Research scope, evidence and operator jobs',
          'Ranked capability proposals and validation gaps',
        ],
        uses: [
          'Current product implementation and accepted delivery constraints',
        ],
        tools: [
          'Define an industry brief',
          'Inspect evidence',
          'Compare capability proposals',
          'Choose a first proof',
        ],
        boundaries: [
          'Research does not generate, deploy or enable a product.',
          'Sources and judgements must remain distinguishable.',
        ],
        service_example:
          'Project ignition can use an accepted brief before creating an owned App preview.',
      },
      title: 'Industry Brief and Capability Discovery',
      decision: 'proposed',
      source_cluster_ids: ['industry-brief'],
      source_tool_ids: ['industry-brief-proof'],
      rationale:
        'Test FireUX’s industry-led differentiation before offering a universal generator.',
    },
    {
      id: 'ecosystem-composition',
      definition: {
        purpose:
          'Choose how branded Apps reuse an ecosystem without sharing unintended data or authority.',
        manages: ['Composition decisions and Project-owned App relationships'],
        uses: [
          'Canonical App and Ecosystem identity',
          'Domain package availability and membership boundaries',
        ],
        tools: [
          'Review ecosystem relationships',
          'Choose reuse scope',
          'Prepare a branded App handoff',
        ],
        boundaries: [
          'A clone does not inherit another operator’s records or permissions.',
          'Project membership does not authorize editing identity in another ecosystem.',
        ],
        service_example:
          'Branded-App setup can compose reusable domains with explicit identity and access boundaries.',
      },
      title: 'Branded Apps and Ecosystem Composition',
      decision: 'proposed',
      source_cluster_ids: ['ecosystem-composition'],
      source_tool_ids: ['ecosystem-reuse-proof'],
      rationale:
        'Reuse belongs alongside explicit ownership, data and membership boundaries. A clone must not inherit another operator’s records or authority.',
    },
    {
      id: 'production-launch-hardening',
      definition: {
        purpose:
          'Assess whether a specific App release is ready for its intended production use.',
        manages: [
          'Release-readiness evidence and unresolved blockers',
          'Explicit acceptance decisions',
        ],
        uses: [
          'Deployment configuration, access checks and data protection evidence',
        ],
        tools: [
          'Review release readiness',
          'Inspect unresolved risks',
          'Record acceptance evidence',
        ],
        boundaries: [
          'Review is not deployment or proof that every security control passed.',
          'Development-open Rules require a separate accepted production policy.',
        ],
        service_example:
          'A launch journey can combine readiness checks with an authorized deployment and rollback plan.',
      },
      title: 'Production Launch and Hardening',
      decision: 'proposed',
      source_cluster_ids: ['production-launch-hardening'],
      source_tool_ids: ['production-readiness-review'],
      rationale:
        'This is the clearest observed gap: verify secrets, authentication redirects, authorization, database protection, deployment configuration, domains, backups and rollback before an App goes live.',
    },
    {
      id: 'identity-access',
      definition: {
        purpose:
          'Understand and manage who can use an App and which actions their context permits.',
        manages: [
          'Project-level access configuration decisions and review evidence',
        ],
        uses: [
          'Auth identity, User and AppUser membership',
          'Domain access records and feature entitlements',
        ],
        tools: [
          'Review sign-in paths',
          'Review memberships and access policy',
          'Test an authorized and denied action',
        ],
        boundaries: [
          'Authentication, membership, domain permission and paid entitlement are separate checks.',
          'Optional FireUX account connections do not grant cross-App authority.',
        ],
        service_example:
          'User onboarding can coordinate sign-in, local membership and domain-specific access.',
      },
      title: 'Identity and Access',
      decision: 'proposed',
      source_cluster_ids: ['identity-data-security'],
      source_tool_ids: ['authentication-access-review'],
      rationale:
        'Authentication, roles and permissions are expected foundations, but FireUX has not yet proved them as one customer self-service capability.',
    },
    {
      id: 'data-security',
      definition: {
        purpose:
          'Review an App’s data ownership, protection and recovery requirements.',
        manages: ['Data-boundary decisions and security review evidence'],
        uses: [
          'Owning database and Storage policies',
          'Domain models, commands and backup configuration',
        ],
        tools: [
          'Review data boundaries',
          'Inspect protection policy',
          'Review backup and restore evidence',
        ],
        boundaries: [
          'This capability does not move domain data into Project ownership.',
          'A review or configuration screen does not itself secure a database.',
        ],
        service_example:
          'Production launch can use a data review before enabling real customer operations.',
      },
      title: 'Data and Security',
      decision: 'proposed',
      source_cluster_ids: ['identity-data-security'],
      source_tool_ids: ['data-security-review'],
      rationale:
        'Protected persistent data, files and secrets are expected foundations, but FireUX has not yet proved a customer-facing data or security product.',
    },
    {
      id: 'app-building',
      definition: {
        purpose:
          'Create and evolve an App owned by the Project, with an explicit product scope.',
        manages: [
          'Project-to-App creation intent and build decisions',
          'Preview and handoff artefacts',
        ],
        uses: [
          'Canonical App and Ecosystem records',
          'Accepted capability brief and available domain packages',
        ],
        tools: [
          'Create an owned App',
          'Review a preview',
          'Prepare a bounded build change',
        ],
        boundaries: [
          'Current App creation and HTML preview are not a generated SaaS product.',
          'Deployment, data authority and cross-ecosystem identity have separate owners.',
        ],
        service_example:
          'Brief-to-preview can coordinate research, owned App creation and a reviewable preview.',
      },
      title: 'Owned App Creation',
      decision: 'proposed',
      source_cluster_ids: ['app-building'],
      source_tool_ids: ['brief-to-app-review'],
      rationale:
        'App-builder demand is established qualitatively, but FireUX must validate its narrower advantage in opinionated, owned App output rather than reproduce prompt-to-prototype competition.',
    },
    {
      id: 'deployment-domains',
      definition: {
        purpose:
          'Manage where an App is previewed or released and how it can be recovered.',
        manages: [
          'Deployment intent, environment references and release evidence',
        ],
        uses: [
          'App-owned hosting configuration',
          'Domain ownership and authorized infrastructure integrations',
        ],
        tools: [
          'Review environments',
          'Prepare a deployment',
          'Connect an authorized domain',
          'Prepare rollback',
        ],
        boundaries: [
          'Preview, deployment and production acceptance are distinct outcomes.',
          'Publishing requires the appropriate infrastructure authority.',
        ],
        service_example:
          'An App release can coordinate deployment, domain checks and rollback verification.',
      },
      title: 'Deployment and Domains',
      decision: 'proposed',
      source_cluster_ids: ['production-launch-hardening'],
      source_tool_ids: ['deployment-domain-review'],
      rationale:
        'Preview, production, domains and rollback are specific operator jobs, but FireUX does not currently expose them as a customer-owned Workspace capability.',
    },
    {
      id: 'billing',
      definition: {
        purpose:
          'Define the App’s subscription offering and understand supported billing states.',
        manages: [
          'Product billing configuration and subscription lifecycle requirements',
        ],
        uses: [
          'Owning payment provider records',
          'App membership and feature entitlement policy',
        ],
        tools: [
          'Review plan configuration',
          'Start a supported subscription action',
          'Review billing evidence',
        ],
        boundaries: [
          'A plan selection is not successful payment.',
          'Provider transactions and access enforcement keep their authoritative owners.',
        ],
        service_example:
          'Subscription onboarding can coordinate checkout evidence with an explicit entitlement update.',
      },
      title: 'Billing and Subscriptions',
      decision: 'proposed',
      source_cluster_ids: ['saas-operation'],
      source_tool_ids: ['billing-subscription-review'],
      rationale:
        'Purchase intent is strong around accepting payments, but existing FireUX finance and optional Stripe integration do not prove a universal SaaS subscription lifecycle.',
    },
    {
      id: 'monitoring-operation',
      definition: {
        purpose:
          'Review an App’s operational health and the evidence needed to respond to problems.',
        manages: ['Operational review configuration and incident decisions'],
        uses: ['Error, usage, release and cost evidence from their producers'],
        tools: [
          'Inspect an incident',
          'Review operational measures',
          'Prepare a corrective change',
        ],
        boundaries: [
          'A dashboard does not create telemetry or prove reliability.',
          'Repair, release and billing actions retain their own authority.',
        ],
        service_example:
          'Incident resolution can combine monitoring evidence, a bounded repair and release verification.',
      },
      title: 'Monitoring and Operation',
      decision: 'proposed',
      source_cluster_ids: ['saas-operation'],
      source_tool_ids: ['monitoring-operation-review'],
      rationale:
        'Post-launch errors, usage, releases and cost are recurring operator concerns, but FireUX does not currently prove an observability product.',
    },
    {
      id: 'generic-project-management',
      title: 'Generic Project Management',
      decision: 'boundary',
      source_cluster_ids: ['generic-project-management'],
      source_tool_ids: ['generic-project-management'],
      rationale:
        'Trello-, Jira- and Asana-style task management is adjacent demand, not the defining job of a FireUX App Project Workspace.',
    },
  ],
  next_step:
    'Prove an industry brief and one owned App handoff before offering automated generation. Establish runtime capabilities only after demand and a useful execution path are proved.',
} satisfies AppSearchDemand['capabilities']

const priorities = [
  'industry-brief',
  'app-building',
  'ecosystem-composition',
  'production-launch-hardening',
  'identity-access',
  'data-security',
  'deployment-domains',
  'billing',
  'monitoring-operation',
]
const sourceEvidence: Record<string, string[]> = {
  'industry-brief': ['project-generation'],
  'app-building': ['project-generation', 'project-ownership'],
  'ecosystem-composition': ['project-remix', 'project-authority'],
  'production-launch-hardening': ['project-release', 'project-authority'],
  'identity-access': ['project-authority'],
  'data-security': ['project-authority'],
  'deployment-domains': ['project-release'],
  billing: ['project-payments'],
  'monitoring-operation': ['project-operation'],
}
export const demandCapabilities: AppSearchDemand['capabilities'] = {
  ...capabilityCandidates,
  capabilities: capabilityCandidates.capabilities.map((capability) => ({
    ...capability,
    ...(priorities.includes(capability.id)
      ? {
          priority: {
            rank: priorities.indexOf(capability.id) + 1,
            rationale:
              'Product validation sequence, not a ranking of legal or security duties.',
          },
          assessment: {
            market: {
              confidence: 'early' as const,
              rationale:
                'Primary documentation demonstrates supplied workflows. FireUX differentiation and paid adoption remain unvalidated.',
              validation_gap:
                'No original creator interviews, measured conversion or willingness-to-pay proof for this offer.',
              source_observation_ids: sourceEvidence[capability.id] ?? [],
            },
            implementation: {
              status:
                capability.id === 'app-building' ||
                capability.id === 'ecosystem-composition'
                  ? ('partial' as const)
                  : ('not-assessed' as const),
              assessed_at: '2026-10-05',
              scope:
                capability.id === 'app-building'
                  ? 'Project Apps has record creation and discovery, not proved industry SaaS generation or deployment.'
                  : capability.id === 'ecosystem-composition'
                    ? 'Project Ecosystem supplies a read view, not proved ecosystem provisioning or safe cloning.'
                    : 'This industry research does not establish a customer-owned execution path for this proposal.',
              source_paths: [
                'packages/ecosystem/fireux-fireux/src/runtime/project/components/Workspace/Apps/Index.vue',
                'packages/ecosystem/fireux-fireux/src/runtime/project/components/Workspace/Ecosystem/Index.vue',
              ],
            },
          },
        }
      : {}),
  })),
}
