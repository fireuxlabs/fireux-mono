import type { ProjectIdentityIntent } from 'fireux-core/runtime/project/models/identity-intent'
import type { TeamAIIntent } from 'fireux-core/runtime/composables/fireux/useTeam'
export type ProjectIntent = ProjectIdentityIntent | TeamAIIntent
