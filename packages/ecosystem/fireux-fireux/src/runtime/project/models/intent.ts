import type { ProjectIdentityIntent } from 'fireux-core/runtime/project/models/identity-intent'
import type { TeamAIIntent } from 'fireux-core/runtime/composables/fireux/useTeam'
import type { TestAIIntent } from 'fireux-core/runtime/composables/fireux/workspace/useTestAI'
export type ProjectIntent = ProjectIdentityIntent | TeamAIIntent | TestAIIntent
