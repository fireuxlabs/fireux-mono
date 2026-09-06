import type { TeamAIIntent } from '../../composables/fireux/workspace/useTeam'
export type ProjectTeamIntent = TeamAIIntent & { jobTitle?: string | null }
