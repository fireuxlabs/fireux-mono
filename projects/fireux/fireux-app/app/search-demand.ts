import { defineAppSearchDemand } from 'fireux-core/config/app/search-demand'

const observedAt = '2026-08-22'
const geography = 'Switzerland'
const language = 'English'

function googleObservations(
  sourceQuery: string,
  signal: string,
  queries: string[],
  note: string
) {
  const sourceUrl = `https://www.google.com/search?q=${encodeURIComponent(sourceQuery).replace(/%20/g, '+')}`
  return queries.map((query) => ({
    query,
    source: 'live-search-results' as const,
    geography,
    language,
    observed_at: observedAt,
    metrics: [{ label: 'Google result signal', value: signal }],
    note,
    source_url: sourceUrl,
  }))
}

export const searchDemand = defineAppSearchDemand({
  domain: 'App project management',
  operator: 'App operators',
  description: 'The domain covers the work required to take a software App from an accepted brief through configuration, development, launch and continued operation. Generic project and task management remain adjacent unless they directly serve that App lifecycle.',
  summary: {
    conclusion: 'Project Workspace should help an App operator move an App from idea through building, launch and ongoing operation. It should not become another generic task-management product.',
    findings: [
      '“App project management software” is ambiguous and is usually interpreted as an App for managing ordinary projects.',
      'Demand language becomes relevant when framed around app development software, app builders, deployment, distribution and the App lifecycle.',
      'The opportunity is lifecycle and platform operation: define, configure, build, test, launch, manage access and continue operating the App.',
    ],
    next_step: 'Research the App lifecycle clusters individually, then derive tools and group them into Project Workspace Capabilities without copying Trello, Jira or generic project-management scope.',
  },
  analysis: {
    summary: 'The evidence separates generic project-management Apps from the App lifecycle and App-building platform markets. Project Workspace belongs to the latter two; the generic project-management cluster is a strong product boundary.',
    clusters: [
      {
        id: 'generic-project-management',
        title: 'Generic project-management software',
        operator_job: 'Plan tasks, timelines and team collaboration for ordinary projects.',
        intents: ['compare', 'choose'],
        evidence_queries: [
          'What is the best project management app?',
          'What is the best app for managing projects?',
          'Top 10 project management tools',
          'Best project management software for small teams',
        ],
        confidence: 'strong',
        interpretation: 'Google overwhelmingly interprets the unqualified phrase as Trello, Asana, Jira and similar work-management products.',
        boundary: 'Project Workspace should not reproduce generic task, Kanban or team project-management software.',
      },
      {
        id: 'app-lifecycle',
        title: 'App-development lifecycle',
        operator_job: 'Take an App from discovery through design, development, testing, deployment and maintenance.',
        intents: ['learn', 'perform'],
        evidence_queries: [
          'What are the 7 stages of app development?',
          'What is a PMO in software?',
          'app development project management',
        ],
        confidence: 'moderate',
        interpretation: 'Lifecycle language is materially closer to the job of an App operator than generic project-management terminology.',
        research_gap: 'Research each lifecycle stage, especially launch readiness, testing, deployment and post-launch operation.',
      },
      {
        id: 'app-building',
        title: 'App builders and development software',
        operator_job: 'Choose and use a platform to build an App with code, low-code, no-code or AI assistance.',
        intents: ['learn', 'compare', 'choose', 'perform'],
        evidence_queries: [
          'App development software',
          'no code app builder',
          'Firebase app builder',
          'Google app maker free',
        ],
        confidence: 'strong',
        interpretation: 'This cluster has the strongest relative interest in the tested set and reflects the practical act of creating an App.',
        research_gap: 'Separate AI builders, no-code, low-code and developer platforms, then compare operator expectations for each.',
      },
      {
        id: 'saas-platform',
        title: 'SaaS platform and viability',
        operator_job: 'Understand SaaS products and choose infrastructure for building a viable hosted App.',
        intents: ['learn', 'compare', 'choose'],
        evidence_queries: [
          'What is a SaaS app?',
          'Is SaaS still profitable in 2026?',
          'Who are the top 10 SaaS providers?',
          'SaaS app development platform GitHub',
        ],
        confidence: 'moderate',
        interpretation: 'The exact platform phrase has low relative interest, while adjacent questions focus on product viability and platform selection.',
        research_gap: 'Research authentication, tenancy, billing, hosting, domains, databases and observability as individual operator jobs.',
      },
      {
        id: 'deployment-distribution',
        title: 'Deployment and distribution',
        operator_job: 'Publish, distribute and continue operating an App after it is built.',
        intents: ['learn', 'compare', 'perform', 'troubleshoot'],
        evidence_queries: [
          'Firebase App Distribution',
          'SaaS app development platform login',
          'SaaS app development platform download',
        ],
        confidence: 'early',
        interpretation: 'Distribution and access appear in related searches, but the current evidence is too thin to define the operational jobs precisely.',
        research_gap: 'Research web deployment, app stores, environments, releases, domains, access and update workflows independently.',
      },
    ],
    next_step: 'Turn the App-owned clusters into a first-pass Project Workspace capability map while keeping generic project management outside the product boundary.',
  },
  capabilities: {
    summary: 'The first Project Workspace capability map follows the App lifecycle and platform-operation work without becoming a generic project-management product.',
    capabilities: [
      {
        id: 'app-lifecycle', title: 'App Lifecycle', decision: 'establish-now',
        source_cluster_ids: ['app-lifecycle'],
        rationale: 'Discovery, design, development, testing, launch and continued operation form the central App-operator lifecycle.',
        research_route: '/app-lifecycle/search-demand',
      },
      {
        id: 'app-building', title: 'App Building', decision: 'establish-now',
        source_cluster_ids: ['app-building'],
        rationale: 'Code, low-code, no-code and AI-assisted building form a candidate capability whose detailed operator tools require deeper investigation.',
        research_route: '/app-building/search-demand',
      },
      {
        id: 'deployment-operation', title: 'Deployment and Operation', decision: 'establish-now',
        source_cluster_ids: ['deployment-distribution'],
        rationale: 'Release, distribution, domains, environments, access and updates are specific App-operator jobs rather than generic project tasks.',
        research_route: '/app-operation/search-demand',
      },
      {
        id: 'saas-platform', title: 'SaaS Platform', decision: 'establish-later',
        source_cluster_ids: ['saas-platform'],
        rationale: 'Platform and viability searches need deeper separation before this becomes an established Project Workspace capability.',
        research_route: '/saas-platform/search-demand',
      },
      {
        id: 'generic-project-management', title: 'Generic Project Management', decision: 'boundary',
        source_cluster_ids: ['generic-project-management'],
        rationale: 'Trello-, Jira- and Asana-style task management is adjacent demand, not the defining job of a FireUX App Project Workspace.',
      },
    ],
    next_step: 'Organise these capabilities in Project Workspace, then deepen App Lifecycle first and derive its operator tools.',
  },
  observations: [
    ...googleObservations(
      'app project management software',
      'People also ask',
      [
        'What is the best project management app?',
        'What is the best app for managing projects?',
        'Does Microsoft 365 have a project management app?',
        'What is the best project management software tool?',
      ],
      'Google interprets this phrase primarily as software for managing ordinary projects, not managing an App project. This is boundary evidence, not a proposed FireUX capability.'
    ),
    ...googleObservations(
      'app project management software',
      'People also search for',
      [
        'Free app project management software',
        'Top 10 project management tools',
        'Best app project management software',
        'App project management software free download',
        'Top 10 project management tools free',
        'List of project management software',
        'Best project management software for small teams',
        'Microsoft project management software',
      ],
      'These related searches confirm that the unqualified phrase belongs to the general project-management software market.'
    ),
    ...googleObservations(
      'app development project management',
      'People also ask',
      [
        'What are the 7 stages of app development?',
        'Will PMP be replaced by AI?',
        'What is a PMO in software?',
        'What are the top 5 project management software?',
      ],
      'This clearer phrase shifts demand toward planning, design, development, testing, deployment and maintenance of an App.'
    ),
    ...googleObservations(
      'SaaS app development platform',
      'People also ask',
      [
        'Who are the top 10 SaaS providers?',
        'Is ChatGPT a SaaS?',
        'Is SaaS still profitable in 2026?',
        'What is a SaaS app?',
      ],
      'The SaaS framing introduces platform selection, viability and product-definition demand.'
    ),
    ...googleObservations(
      'SaaS app development platform',
      'People also search for',
      [
        'SaaS app development platform GitHub',
        'SaaS app development platform login',
        'SaaS app development platform download',
        'Firebase app builder',
        'App development software',
        'Firebase Studio',
        'Firebase App Distribution',
        'Google app maker free',
      ],
      'Related searches connect the job to building, authentication, distribution, hosting and low-code or AI-assisted App creation.'
    ),
    ...[
      ['app project management software', 3],
      ['app development project management', 1],
      ['SaaS app development platform', 0],
      ['no code app builder', 6],
      ['app development software', 19],
    ].map(([query, interest]) => ({
      query: String(query),
      source: 'google-trends' as const,
      geography: 'Worldwide',
      language: 'All languages',
      observed_at: observedAt,
      period: 'Past five years',
      metrics: [{ label: 'Relative average interest', value: Number(interest) }],
      note: 'Relative only within this five-query comparison; this is not monthly search volume.',
      source_url: 'https://trends.google.com/trends/explore?date=today%205-y&q=app%20project%20management%20software,app%20development%20project%20management,SaaS%20app%20development%20platform,no%20code%20app%20builder,app%20development%20software',
    })),
  ],
})
