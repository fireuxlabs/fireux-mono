import type { ProjectIdentityIntent } from 'fireux-fireux/runtime/project/models/identity-intent'
import type { TeamAIIntent } from 'fireux-core/runtime/composables/fireux/useTeam'
export type ProjectIntent = ProjectIdentityIntent | TeamAIIntent
