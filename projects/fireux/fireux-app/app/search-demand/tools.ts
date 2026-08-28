import type { AppSearchDemand } from 'fireux-core/config/app/search-demand'

export const demandTools = {
  summary:
    'These are demand-validation offers and reviews, not released FireUX Tools. Only the production-readiness review is ready for a bounded offer test.',
  tools: [
    {
      id: 'production-readiness-review',
      title: 'Production Readiness Review',
      source_cluster_ids: ['production-launch-hardening'],
      operator_job:
        'Find the concrete work between a functioning prototype and a controlled production launch.',
      outcome:
        'A launch decision with named blockers across secrets, access, data protection, deployment, domains, backups and rollback.',
      status: 'test-now',
    },
    {
      id: 'authentication-access-review',
      title: 'Authentication and Access Review',
      source_cluster_ids: ['identity-data-security'],
      operator_job:
        'Check how users sign in and which records and actions each role can access.',
      outcome:
        'A bounded authentication, authorization and redirect-risk assessment.',
      status: 'research-next',
    },
    {
      id: 'data-security-review',
      title: 'Data and Security Review',
      source_cluster_ids: ['identity-data-security'],
      operator_job:
        'Check persistent data, files, secrets, rules and backups before production use.',
      outcome:
        'A bounded list of exposed data paths, missing controls and recovery requirements.',
      status: 'research-next',
    },
    {
      id: 'brief-to-app-review',
      title: 'Brief-to-App Fit Review',
      source_cluster_ids: ['app-building'],
      operator_job:
        "Determine whether an accepted brief fits FireUX's opinionated App foundation and owned output.",
      outcome:
        'A build-fit decision that separates reusable FireUX foundations from quoted new development.',
      status: 'research-next',
    },
    {
      id: 'deployment-domain-review',
      title: 'Deployment and Domain Review',
      source_cluster_ids: ['production-launch-hardening'],
      operator_job:
        'Check preview and production environments, deployment configuration, domains and rollback.',
      outcome:
        'A release-path assessment with environment, DNS and rollback blockers.',
      status: 'research-next',
    },
    {
      id: 'billing-subscription-review',
      title: 'Billing and Subscription Review',
      source_cluster_ids: ['saas-operation'],
      operator_job:
        'Define plans, payments, subscription states and webhook responsibilities for a SaaS App.',
      outcome:
        'A billing lifecycle boundary and integration requirements without implying a released billing product.',
      status: 'later',
    },
    {
      id: 'monitoring-operation-review',
      title: 'Monitoring and Operation Review',
      source_cluster_ids: ['saas-operation'],
      operator_job:
        'Determine which failures, releases, usage and costs an App operator must inspect after launch.',
      outcome:
        'An observability requirement set bounded to proved operational decisions.',
      status: 'later',
    },
    {
      id: 'generic-project-management',
      title: 'Generic Project Management',
      source_cluster_ids: ['generic-project-management'],
      operator_job: 'Plan ordinary tasks, boards, sprints and team projects.',
      outcome: 'No FireUX Tool; use a dedicated project-management product.',
      status: 'boundary',
    },
  ],
  next_step:
    'Test the Production Readiness Review with qualified App owners, then use completed reviews to decide whether any repeated execution belongs in Project Workspace.',
} satisfies AppSearchDemand['tools']
