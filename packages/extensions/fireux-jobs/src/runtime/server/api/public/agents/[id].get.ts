import { createPublicProfileDetailHandler } from 'fireux-core/runtime/server/utils/public-projection/public-profile'
import { publicAgentProfileConfig } from '../../../utils/public-profile/jobs-profile'

export default createPublicProfileDetailHandler(publicAgentProfileConfig)
