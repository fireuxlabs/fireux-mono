import { createPublicProfileCollectionHandler } from 'fireux-core/runtime/server/utils/public-projection/public-profile.ts'
import { publicAgentProfileConfig } from '../../utils/public-profile/jobs-profile'

export default createPublicProfileCollectionHandler(publicAgentProfileConfig)
