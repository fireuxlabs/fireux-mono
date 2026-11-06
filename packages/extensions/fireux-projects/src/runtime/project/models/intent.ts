import type { ProjectIdentityIntent } from './identity-intent'
import type { TeamAIIntent } from 'fireux-core/runtime/workspace/composables/useWorkspaceTeam'
export type ProjectIntent = ProjectIdentityIntent | TeamAIIntent
