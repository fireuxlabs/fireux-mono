import { createPublicProfileDetailHandler } from 'fireux-core/runtime/server/utils/public-projection/public-profile.ts'
import { publicChefProfileConfig } from '../../../utils/public-profile/kitchen-profile'

export default createPublicProfileDetailHandler(publicChefProfileConfig)
