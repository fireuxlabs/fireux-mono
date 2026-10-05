import type { AppSearchDemand } from 'fireux-core/config/app/search-demand'

export const currentProjectEvidence = [
  {
    id: 'project-generation',
    source: 'product-documentation',
    query: 'Natural-language app generation and reusable templates',
    source_url: 'https://firebase.google.com/docs/studio',
    finding:
      'Firebase Studio offers generated prototypes, templates and a transition into developer-controlled code.',
    limitations:
      'Existing product supply supports category expectations; industry-specific FireUX demand and generation quality remain unproved.',
    geography: 'International product documentation',
    language: 'English',
    observed_at: '2026-10-05',
  },
  {
    id: 'project-remix',
    source: 'product-documentation',
    query: 'Reuse an application without copying operational identity',
    source_url: 'https://docs.lovable.dev/features/projects/remix',
    finding:
      'Lovable distinguishes copied code and schema from source records, secrets, collaborators and domains.',
    limitations:
      'A competitor feature is not FireUX adoption or proof of FireUX cloning. Separate customer data and new authority remain required.',
    geography: 'International product documentation',
    language: 'English',
    observed_at: '2026-10-05',
  },
  {
    id: 'project-ownership',
    source: 'product-documentation',
    query: 'Code export and ongoing development ownership',
    source_url: 'https://docs.lovable.dev/integrations/github',
    finding:
      'Lovable documents code export and Git synchronization for continued development and external deployment.',
    limitations:
      'Code portability does not alone establish data portability or an economic advantage for FireUX.',
    geography: 'International product documentation',
    language: 'English',
    observed_at: '2026-10-05',
  },
  {
    id: 'project-authority',
    source: 'product-documentation',
    query: 'Separate interface convenience from execution and data authority',
    source_url: 'https://docs.lovable.dev/tips-tricks/security-best-practices',
    finding:
      'Lovable documents server validation and authorization alongside database policy for private and shared data.',
    limitations:
      'This documents another stack; no FireUX security or tenant isolation acceptance is inferred.',
    geography: 'International product documentation',
    language: 'English',
    observed_at: '2026-10-05',
  },
  {
    id: 'project-release',
    source: 'product-documentation',
    query: 'Publishing a generated app has a distinct release workflow',
    source_url: 'https://firebase.google.com/docs/studio/deploy-app',
    finding:
      'Firebase Studio documents publishing with hosting and project prerequisites.',
    limitations:
      'A provider publishing path does not prove FireUX infrastructure provisioning, safe deployment or client demand.',
    geography: 'International product documentation',
    language: 'English',
    observed_at: '2026-10-05',
  },
  {
    id: 'project-payments',
    source: 'product-documentation',
    query: 'Application platforms include payments and subscriptions',
    source_url: 'https://support.bolt.new/cloud/bolt-cloud',
    finding:
      'Bolt documents payment integration for one-time purchases and subscriptions alongside App hosting, data and analytics.',
    limitations:
      'Existing product supply is category evidence, not FireUX billing readiness or paid demand.',
    geography: 'International product documentation',
    language: 'English',
    observed_at: '2026-10-05',
  },
  {
    id: 'project-operation',
    source: 'operational-guidance',
    query: 'Diagnose production failures after publishing an application',
    source_url: 'https://docs.replit.com/build/troubleshooting',
    finding:
      'Replit directs operators to production logs, startup errors, secrets, build commands and environment differences when diagnosing publishing failures.',
    limitations:
      'Troubleshooting guidance supports an operational job; it does not establish a complete observability product or FireUX adoption.',
    geography: 'International product documentation',
    language: 'English',
    observed_at: '2026-10-05',
  },
] satisfies AppSearchDemand['observations']
