import type { ProjectIdentityIntent } from 'fireux-core/runtime/project/models/identity-intent'
import type { ProjectTeamIntent } from 'fireux-core/runtime/project/models/team-intent'
import type { TestAIIntent } from 'fireux-core/runtime/composables/fireux/workspace/useTestAI'
export type ProjectIntent = ProjectIdentityIntent | ProjectTeamIntent | TestAIIntent
