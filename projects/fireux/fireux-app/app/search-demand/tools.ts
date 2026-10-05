import type { AppSearchDemand } from 'fireux-core/config/app/search-demand'

export const demandTools = {
  summary:
    'These are demand-validation offers and reviews, not released FireUX Tools. The Industry Brief Proof is the first bounded offer test; release readiness remains a separate review.',
  tools: [
    {
      id: 'industry-brief-proof',
      title: 'Industry Brief Proof',
      source_cluster_ids: ['industry-brief'],
      operator_job:
        'Choose an industry and translate operator jobs into a bounded product brief.',
      outcome:
        'A sourced, ranked brief with one acceptance journey, clear ownership and deferred work.',
      status: 'test-now',
    },
    {
      id: 'ecosystem-reuse-proof',
      title: 'Branded App Reuse Proof',
      source_cluster_ids: ['ecosystem-composition'],
      operator_job:
        'Reuse supported product behaviour for a new brand without copying customer records or authority.',
      outcome:
        'A stated reuse boundary and an independently owned App; shared identity and membership are explicit decisions.',
      status: 'research-next',
    },
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
    'Run one Industry Brief Proof, then a brief-to-App fit review. Reuse and release need separate acceptance outcomes.',
} satisfies AppSearchDemand['tools']
