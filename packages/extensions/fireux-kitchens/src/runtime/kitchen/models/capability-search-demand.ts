import { kitchenOperationAgents } from './operation-agents'
import { kitchenOperations } from './operations'

export type KitchenCapabilityResearchStatus =
  | 'not-connected'
  | 'handshake'
  | 'connected'
  | 'complete'

export type KitchenCapabilitySearchDemandSubject = {
  slug: string
  title: string
  headline: string
  question: string
  status: KitchenCapabilityResearchStatus
  source: string
  queries: readonly string[]
  boundary: string
}

const workspaceSubjects = [
  {
    slug: 'calendar',
    title: 'Calendar',
    headline: 'Kitchen Calendar',
    question: 'Do Kitchen operators seek one date-scoped view across their current work, risks and decisions?',
    queries: ['restaurant daily operations checklist', 'restaurant manager daily checklist', 'kitchen daily task list'],
    boundary: 'Calendar is a date-scoped aggregation surface. Research must not turn it into an independent data owner or specialist AI without evidence.',
  },
  {
    slug: 'overview',
    title: 'Overview',
    headline: 'Kitchen Overview',
    question: 'What must an operator understand before entering a specific Kitchen capability?',
    queries: ['restaurant operations dashboard', 'kitchen management dashboard', 'restaurant management overview'],
    boundary: 'Overview summarises proven child capabilities. It must not become a second source of operational truth.',
  },
  {
    slug: 'identity',
    title: 'Identity',
    headline: 'Kitchen Identity',
    question: 'What venue identity information do Kitchen operators need to maintain and publish?',
    queries: ['restaurant profile management', 'restaurant business information management', 'restaurant location profile'],
    boundary: 'Place owns venue identity and location. Kitchen Identity composes that authority without copying it onto Kitchen.',
  },
  {
    slug: 'team',
    title: 'Team',
    headline: 'Kitchen Team and Training',
    question: 'What Kitchen-specific team, responsibility, training and handover jobs are operators trying to perform?',
    queries: ['restaurant employee training checklist', 'restaurant shift handover checklist', 'kitchen staff training matrix'],
    boundary: 'Kitchen roles, station competence and handover are in scope; payroll and generic HR are not.',
  },
] as const

export const kitchenCapabilitySearchDemandSubjects: KitchenCapabilitySearchDemandSubject[] = [
  ...workspaceSubjects.map((subject) => ({
    ...subject,
    status:
      kitchenOperationAgents.find((agent) => agent.operationSlug === subject.slug)
        ?.maturity ?? ('not-connected' as const),
    source: 'Level-one Kitchen-domain research seeds; dedicated capability observation pending.',
  })),
  ...kitchenOperations.map((operation) => ({
    slug: operation.slug,
    title: operation.title,
    headline: operation.headline,
    question: `What are Kitchen operators trying to do when they search for ${operation.headline.toLowerCase()}?`,
    status:
      kitchenOperationAgents.find(
        (agent) => agent.operationSlug === operation.slug
      )?.maturity ?? ('not-connected' as const),
    source: 'Queries retained from the level-one Kitchen-domain research. A dedicated greenfield capability pass is still required.',
    queries: operation.keywords,
    boundary: operation.guidingLiterature.summary,
  })),
]

export function findKitchenCapabilitySearchDemandSubject(
  slug: string
): KitchenCapabilitySearchDemandSubject | undefined {
  return kitchenCapabilitySearchDemandSubjects.find(
    (subject) => subject.slug === slug
  )
}
