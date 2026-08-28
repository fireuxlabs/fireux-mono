import type { AppSearchDemand } from 'fireux-core/config/app/search-demand'

const observedAt = '2026-08-28'
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

function currentEvidence(
  query: string,
  signal: string,
  note: string,
  sourceUrl: string
) {
  return {
    query,
    source: 'live-search-results' as const,
    geography: 'Worldwide',
    language,
    observed_at: observedAt,
    metrics: [{ label: 'Current source signal', value: signal }],
    note,
    source_url: sourceUrl,
  }
}

export const demandObservations = [
  currentEvidence(
    'AI app builder with authentication and database',
    'Official product documentation',
    'Firebase Studio presents App prototyping with Cloud Firestore and Firebase Authentication. This proves current category language and product expectations, not FireUX demand or search volume.',
    'https://firebase.google.com/docs/studio'
  ),
  currentEvidence(
    'deploy AI-built app to production',
    'Official product documentation',
    'Firebase Studio documents separate publishing paths, project and billing prerequisites, and production deployment. This is lifecycle evidence, not a claim that deployment alone is a FireUX product.',
    'https://firebase.google.com/docs/studio/deploy-app'
  ),
  currentEvidence(
    'SaaS roles permissions database files analytics payments',
    'Official product documentation',
    'Bolt Cloud groups databases, authentication, roles and permissions, file storage, functions, analytics and Stripe payments. This shows the breadth operators are taught to expect from an App platform.',
    'https://support.bolt.new/cloud/bolt-cloud'
  ),
  currentEvidence(
    'app works in preview but not production',
    'Official troubleshooting documentation',
    'Replit distinguishes preview from production and directs operators to check secrets, database settings, login redirects, payment redirects, build output and logs. This directly supports a production-readiness job.',
    'https://docs.replit.com/build/troubleshooting'
  ),
  currentEvidence(
    'app builder pricing after launch',
    'Official pricing documentation',
    'Current products meter different units: Lovable uses credits for building, hosting and AI features; Bolt prices token and platform capacity; Bubble meters workload; Replit meters production infrastructure usage. This establishes cost-comparison friction but not willingness to pay FireUX.',
    'https://lovable.dev/pricing'
  ),
  currentEvidence(
    'production-ready AI-built App',
    'Operator discussion',
    'A current SaaS discussion names row-level security, exposed secrets, backups, monitoring and rollback as issues after a generated App reaches production. This is qualitative directional evidence from self-selected participants, not a representative survey.',
    'https://www.reddit.com/r/SaaS/comments/1ure2of/help_how_are_you_all_handling/'
  ),
  currentEvidence(
    'app builder code ownership and vendor lock-in',
    'Operator discussion',
    'Current no-code discussions repeatedly connect switching cost to code, data, business-logic portability and later pricing changes. These discussions support an ownership hypothesis but do not prove that it changes purchase decisions.',
    'https://www.reddit.com/r/nocode/comments/1rl2sk0/nobody_warns_you_about_the_switching_cost_until/'
  ),
  currentEvidence(
    'Swiss cloud App data protection',
    'Swiss regulator guidance',
    'The Swiss data-protection authority directs cloud customers to assess processors, security and cross-border disclosure. This makes deployment location and provider terms relevant in Switzerland without proving search demand for a Swiss-hosted builder.',
    'https://www.edoeb.admin.ch/en/data-processing-in-the-cloud'
  ),
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
    metrics: [
      { label: 'Relative average interest', value: Number(interest) },
    ],
    note: 'Relative only within this five-query comparison; this is not monthly search volume.',
    source_url:
      'https://trends.google.com/trends/explore?date=today%205-y&q=app%20project%20management%20software,app%20development%20project%20management,SaaS%20app%20development%20platform,no%20code%20app%20builder,app%20development%20software',
  })),
] satisfies AppSearchDemand['observations']
