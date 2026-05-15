// Repo-level demo payloads for Agents.
// Use these records for dev surfaces, examples, and explicit preflight demos.
// They are not canonical storage or runtime contracts.

import { demoUserList } from './user.demo'

type AgentBase = {
  id: string
  userId: string
  to: string
  secondaryAvatarUrl: string
  tagline: string
  badges: string[]
  bioShort: string
  contactEmail: string
  contactPhone: string
  websiteUrl: string
}

const demoUsersById = new Map(demoUserList.map((user) => [user.id, user]))

const requireDemoUser = (userId: string) => {
  const user = demoUsersById.get(userId)
  if (!user) {
    throw new Error(`[agent.demo] Missing shared demo user: ${userId}`)
  }
  return user
}

export const demoAgentBaseList = [
  {
    id: 'agent_demo_001',
    userId: 'demo-user-agent-mila',
    to: '',
    secondaryAvatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=160&q=80',
    tagline: 'Hospitality placements · Alpine & coastal',
    badges: ['Alpine', 'Executive'],
    bioShort: 'Matchmaking kitchens with talent across Europe and the U.S.',
    contactEmail: 'mila@harbor-grid.demo',
    contactPhone: '',
    websiteUrl: '',
  },
  {
    id: 'agent_demo_002',
    userId: 'demo-user-agent-ethan',
    to: '',
    secondaryAvatarUrl: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=160&q=80',
    tagline: 'Seasonal staffing · Resorts & retreats',
    badges: ['Seasonal', 'Remote'],
    bioShort: 'Specializes in short-term placements and resort openings.',
    contactEmail: 'ethan@harbor-grid.demo',
    contactPhone: '',
    websiteUrl: '',
  },
  {
    id: 'agent_demo_003',
    userId: 'demo-user-agent-sofia',
    to: '',
    secondaryAvatarUrl: 'https://images.unsplash.com/photo-1528892952291-009c663ce843?auto=format&fit=crop&w=160&q=80',
    tagline: 'Private chef placements · EU + UK',
    badges: ['Private', 'Executive'],
    bioShort: 'Pairs premium kitchens with executive-level talent.',
    contactEmail: 'sofia@harbor-grid.demo',
    contactPhone: '',
    websiteUrl: '',
  },
] satisfies AgentBase[]

export const demoAgentList = demoAgentBaseList.map((base) => {
  const user = requireDemoUser(base.userId)

  return {
    id: base.id,
    user_id: user.id,
    display_name: user.display_name,
    tagline: base.tagline,
  }
})

const buildAgentPill = (base: (typeof demoAgentBaseList)[number]) => {
  const user = requireDemoUser(base.userId)

  return {
    to: base.to,
    avatarUrl: user.avatar,
    secondaryAvatarUrl: base.secondaryAvatarUrl,
    displayName: user.display_name,
    tagline: base.tagline,
    badges: base.badges,
  }
}

const buildAgentCell = (base: (typeof demoAgentBaseList)[number]) => ({
  ...buildAgentPill(base),
  bioShort: base.bioShort,
})

const buildAgentPreview = (base: (typeof demoAgentBaseList)[number]) => ({
  ...buildAgentPill(base),
  id: base.id,
  summary: base.bioShort,
  contactEmail: base.contactEmail,
  contactPhone: base.contactPhone,
  websiteUrl: base.websiteUrl,
})

export const demoAgentPillList = demoAgentBaseList.map(buildAgentPill)
export const demoAgentCellList = demoAgentBaseList.map(buildAgentCell)
export const demoAgentPreviewList = demoAgentBaseList.map(buildAgentPreview)

export const demoAgentBase = demoAgentBaseList[0]
export const demoAgent = demoAgentList[0]
export const demoAgentPill = demoAgentPillList[0]
export const demoAgentCell = demoAgentCellList[0]
export const demoAgentPreview = demoAgentPreviewList[0]
