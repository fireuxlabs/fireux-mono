// Repo-level demo payloads for Agents.
// Use these records for dev surfaces, examples, and explicit preflight demos.
// They are not canonical storage or runtime contracts.

type AgentBase = {
  id: string
  to: string
  avatarUrl: string
  secondaryAvatarUrl: string
  displayName: string
  tagline: string
  badges: string[]
  bioShort: string
  contactEmail: string
  contactPhone: string
  websiteUrl: string
}

export const demoAgentBaseList = [
  {
    id: 'agent_demo_001',
    to: '',
    avatarUrl: 'https://images.unsplash.com/photo-1528892952291-009c663ce843?auto=format&fit=crop&w=240&q=80',
    secondaryAvatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=160&q=80',
    displayName: 'Mila Ortiz',
    tagline: 'Hospitality placements · Alpine & coastal',
    badges: ['Alpine', 'Executive'],
    bioShort: 'Matchmaking kitchens with talent across Europe and the U.S.',
    contactEmail: 'mila@harbor-grid.demo',
    contactPhone: '',
    websiteUrl: '',
  },
  {
    id: 'agent_demo_002',
    to: '',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80',
    secondaryAvatarUrl: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=160&q=80',
    displayName: 'Ethan Brooks',
    tagline: 'Seasonal staffing · Resorts & retreats',
    badges: ['Seasonal', 'Remote'],
    bioShort: 'Specializes in short-term placements and resort openings.',
    contactEmail: 'ethan@harbor-grid.demo',
    contactPhone: '',
    websiteUrl: '',
  },
  {
    id: 'agent_demo_003',
    to: '',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=240&q=80',
    secondaryAvatarUrl: 'https://images.unsplash.com/photo-1528892952291-009c663ce843?auto=format&fit=crop&w=160&q=80',
    displayName: 'Sofia Ibarra',
    tagline: 'Private chef placements · EU + UK',
    badges: ['Private', 'Executive'],
    bioShort: 'Pairs premium kitchens with executive-level talent.',
    contactEmail: 'sofia@harbor-grid.demo',
    contactPhone: '',
    websiteUrl: '',
  },
] satisfies AgentBase[]

export const demoAgentList = demoAgentBaseList.map((base) => ({
  id: base.id,
  user_id: `user_${base.id}`,
  display_name: base.displayName,
  tagline: base.tagline,
}))

const buildAgentPill = (base: (typeof demoAgentBaseList)[number]) => ({
  to: base.to,
  avatarUrl: base.avatarUrl,
  secondaryAvatarUrl: base.secondaryAvatarUrl,
  displayName: base.displayName,
  tagline: base.tagline,
  badges: base.badges,
})

const buildAgentCell = (base: (typeof demoAgentBaseList)[number]) => ({
  to: base.to,
  avatarUrl: base.avatarUrl,
  secondaryAvatarUrl: base.secondaryAvatarUrl,
  displayName: base.displayName,
  tagline: base.tagline,
  badges: base.badges,
  bioShort: base.bioShort,
})

const buildAgentPreview = (base: (typeof demoAgentBaseList)[number]) => ({
  id: base.id,
  to: base.to,
  avatarUrl: base.avatarUrl,
  secondaryAvatarUrl: base.secondaryAvatarUrl,
  displayName: base.displayName,
  tagline: base.tagline,
  badges: base.badges,
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
