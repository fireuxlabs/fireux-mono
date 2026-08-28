import type { AppSearchDemand } from 'fireux-core/config/app/search-demand'

export const demandCapabilities = {
  summary:
    'This is an opportunity order, not a released Project Workspace catalogue. Production launch and hardening is the first candidate to validate; the remaining items need narrower demand and product proofs.',
  capabilities: [
    {
      id: 'production-launch-hardening',
      title: 'Production Launch and Hardening',
      decision: 'establish-now',
      source_cluster_ids: ['production-launch-hardening'],
      source_tool_ids: ['production-readiness-review'],
      rationale:
        'This is the clearest observed gap: verify secrets, authentication redirects, authorization, database protection, deployment configuration, domains, backups and rollback before an App goes live.',
    },
    {
      id: 'identity-access',
      title: 'Identity and Access',
      decision: 'establish-later',
      source_cluster_ids: ['identity-data-security'],
      source_tool_ids: ['authentication-access-review'],
      rationale:
        'Authentication, roles and permissions are expected foundations, but FireUX has not yet proved them as one customer self-service capability.',
    },
    {
      id: 'data-security',
      title: 'Data and Security',
      decision: 'establish-later',
      source_cluster_ids: ['identity-data-security'],
      source_tool_ids: ['data-security-review'],
      rationale:
        'Protected persistent data, files and secrets are expected foundations, but FireUX has not yet proved a customer-facing data or security product.',
    },
    {
      id: 'app-building',
      title: 'Owned App Creation',
      decision: 'establish-later',
      source_cluster_ids: ['app-building'],
      source_tool_ids: ['brief-to-app-review'],
      rationale:
        'App-builder demand is established qualitatively, but FireUX must validate its narrower advantage in opinionated, owned App output rather than reproduce prompt-to-prototype competition.',
    },
    {
      id: 'deployment-domains',
      title: 'Deployment and Domains',
      decision: 'establish-later',
      source_cluster_ids: ['production-launch-hardening'],
      source_tool_ids: ['deployment-domain-review'],
      rationale:
        'Preview, production, domains and rollback are specific operator jobs, but FireUX does not currently expose them as a customer-owned Workspace capability.',
    },
    {
      id: 'billing',
      title: 'Billing and Subscriptions',
      decision: 'establish-later',
      source_cluster_ids: ['saas-operation'],
      source_tool_ids: ['billing-subscription-review'],
      rationale:
        'Purchase intent is strong around accepting payments, but existing FireUX finance and optional Stripe integration do not prove a universal SaaS subscription lifecycle.',
    },
    {
      id: 'monitoring-operation',
      title: 'Monitoring and Operation',
      decision: 'establish-later',
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
    'Run a bounded production-launch offer test. Establish a Workspace capability only after qualified demand and one useful customer-owned execution path are proved.',
} satisfies AppSearchDemand['capabilities']
