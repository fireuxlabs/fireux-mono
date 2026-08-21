import { createProfileDetailHandler } from 'fireux-core/runtime/user/server/directory/profile-directory'
import { agentProfileDirectory } from '../../utils/public-profile/jobs-profile'

export default createProfileDetailHandler(agentProfileDirectory)
