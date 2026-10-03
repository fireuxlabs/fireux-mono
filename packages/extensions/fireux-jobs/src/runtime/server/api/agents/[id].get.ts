import { createProfileDetailHandler } from 'fireux-core/runtime/user/server/directory/profile-directory'
import { agentProfileDirectory } from '../../../user/server/directory/jobs-profile'

export default createProfileDetailHandler(agentProfileDirectory)
