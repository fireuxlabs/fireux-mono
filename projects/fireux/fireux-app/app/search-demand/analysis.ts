import type { AppSearchDemand } from 'fireux-core/config/app/search-demand'

export const demandSummary = {
  conclusion:
    'FireUX should help creators ignite and organise an industry SaaS: validate the industry brief, produce an owned App, and reuse supported behaviour across deliberate ecosystem boundaries. Production readiness is one stage of that lifecycle.',
  findings: [
    '“App project management software” is ambiguous and is usually interpreted as an App for managing ordinary projects.',
    'Current App-builder products present authentication, databases, deployment, domains, payments and monitoring as parts of one App lifecycle.',
    'Operator discussions repeatedly move from fast prototyping to production security, secrets, backups, deployment, rollback, cost and portability concerns.',
    'Current evidence is qualitative. It does not provide monthly search volume, keyword difficulty, CPC or FireUX conversion evidence.',
  ],
  next_step:
    'Test one industry brief and a bounded brief-to-App handoff, then prove reuse and release separately. No generation or provisioning capability is implied by this research.',
} satisfies AppSearchDemand['summary']

export const demandAnalysis = {
  summary:
    'Current product documentation and operator language support an App creation-and-operation lifecycle. The first FireUX-specific hypothesis is turning an industry brief into an owned App; generic project management remains a strong boundary.',
  clusters: [
    {
      id: 'industry-brief',
      title: 'Industry brief and capability discovery',
      operator_job:
        'Turn a specific industry problem into a bounded SaaS brief and a ranked set of jobs.',
      intents: ['learn', 'choose', 'perform'],
      evidence_queries: [
        'industry-specific SaaS brief',
        'reusable app templates',
      ],
      confidence: 'early',
      source_observation_ids: ['project-generation'],
      interpretation:
        'Templates and natural-language generation demonstrate existing product supply. FireUX can test an industry-led brief; category activity does not prove its differentiation.',
      research_gap:
        'Observe a creator choosing an industry and jobs; test whether the brief produces a useful, owned product scope.',
    },
    {
      id: 'ecosystem-composition',
      title: 'Branded Apps and ecosystem composition',
      operator_job:
        'Reuse supported product behaviour for a new brand while defining data and access boundaries.',
      intents: ['choose', 'perform'],
      evidence_queries: [
        'reuse SaaS app for a new brand',
        'shared ecosystem identity',
      ],
      confidence: 'early',
      source_observation_ids: [
        'project-remix',
        'project-authority',
        'project-ownership',
      ],
      interpretation:
        'Remixing and code ownership are supplied today. Connected branded Apps need a deliberate shared-versus-isolated authority contract; competitor docs do not validate FireUX ecosystem demand.',
      research_gap:
        'Test one branded App with an explicit reuse boundary, new ownership, membership and customer-data policy.',
    },
    {
      id: 'generic-project-management',
      title: 'Generic project-management software',
      operator_job:
        'Plan tasks, timelines and team collaboration for ordinary projects.',
      intents: ['compare', 'choose'],
      evidence_queries: [
        'What is the best project management app?',
        'What is the best app for managing projects?',
        'Top 10 project management tools',
        'Best project management software for small teams',
      ],
      confidence: 'strong',
      interpretation:
        'Google overwhelmingly interprets the unqualified phrase as Trello, Asana, Jira and similar work-management products.',
      boundary:
        'Project Workspace should not reproduce generic task, Kanban or team project-management software.',
    },
    {
      id: 'production-launch-hardening',
      title: 'Production launch and hardening',
      operator_job:
        'Turn a working App prototype into a secure, controlled live product.',
      intents: ['choose', 'perform', 'troubleshoot'],
      evidence_queries: [
        'deploy AI-built app to production',
        'production-ready SaaS app',
        'secure no-code app before launch',
        'app works in preview but not production',
      ],
      confidence: 'moderate',
      interpretation:
        'Official builder documentation and operator discussions converge on secrets, access, data security, environment differences, domains, backups, release checks and rollback as the work between prototype and production.',
      research_gap:
        'Measure qualified requests for a production-readiness review and determine whether buyers want software, guided setup or delivered hardening.',
    },
    {
      id: 'app-building',
      title: 'App builders and development software',
      operator_job:
        'Choose and use a platform to build an App with code, low-code, no-code or AI assistance.',
      intents: ['learn', 'compare', 'choose', 'perform'],
      evidence_queries: [
        'App development software',
        'no code app builder',
        'Firebase app builder',
        'Google app maker free',
      ],
      confidence: 'strong',
      interpretation:
        'The earlier relative comparison found more interest in App-development and no-code-builder language than in App project management, while current competitors already make prompt-to-prototype creation a baseline offer.',
      research_gap:
        'Test whether an opinionated, owned Firebase and Nuxt result is sufficiently different from established AI, no-code and developer platforms.',
    },
    {
      id: 'identity-data-security',
      title: 'Identity, data and security',
      operator_job:
        'Give an App users, protected data, files, secrets, roles and permissions that remain safe in production.',
      intents: ['choose', 'perform', 'troubleshoot'],
      evidence_queries: [
        'AI app builder with authentication and database',
        'SaaS roles and permissions',
        'secure app database rules',
        'exposed API keys app builder',
      ],
      confidence: 'moderate',
      interpretation:
        'Firebase Studio, Bolt and Replit all give authentication and persistent data first-class product or guidance surfaces; production guidance adds authorization, secrets and database rules.',
      research_gap:
        'Separate demand for a configured foundation from demand for a generic schema or database builder, which FireUX does not currently prove.',
    },
    {
      id: 'saas-operation',
      title: 'Billing and continued operation',
      operator_job:
        'Charge for the App and understand its releases, failures, usage and operating cost after launch.',
      intents: ['compare', 'choose', 'perform', 'troubleshoot'],
      evidence_queries: [
        'build SaaS app with Stripe subscriptions',
        'SaaS monitoring and error tracking',
        'app builder pricing after launch',
        'rollback failed app deployment',
      ],
      confidence: 'moderate',
      interpretation:
        'Builder products expose payments, analytics or monitoring and meter production through different credit, token, workload or infrastructure units. This establishes operator concerns but not one universal FireUX capability.',
      research_gap:
        'Validate Stripe subscription work, release health and cost visibility separately before grouping them as one operation product.',
    },
  ],
  next_step:
    'Validate the industry brief first, then owned App creation and deliberate ecosystem reuse. Keep release, security, billing and monitoring as distinct responsibilities.',
} satisfies AppSearchDemand['analysis']
