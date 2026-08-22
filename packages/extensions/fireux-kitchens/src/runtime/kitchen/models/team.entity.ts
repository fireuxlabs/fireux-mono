import { defineFireuxEntity } from 'fireux-core/runtime/models/utils/entity.model'
import { KitchenTeamJoinRequestStorage, KitchenTeamMemberStorage } from '../utils/team.ts'
export const KitchenTeamMemberRecord = defineFireuxEntity({ kind: 'record', name: 'KitchenTeamMember', family: ['kitchen', 'support'], identity: 'parent-scoped', authority: 'parent', appSupport: 'none', workspace: false, parent: 'Kitchen', scoped: KitchenTeamMemberStorage.path })
export const KitchenTeamJoinRequestRecord = defineFireuxEntity({ kind: 'record', name: 'KitchenTeamJoinRequest', family: ['kitchen', 'support'], identity: 'parent-scoped', authority: 'parent', appSupport: 'none', workspace: false, parent: 'Kitchen', scoped: KitchenTeamJoinRequestStorage.path })
