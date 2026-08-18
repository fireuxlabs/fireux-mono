import { createPublicProfileDetailHandler } from 'fireux-core/runtime/server/utils/public-projection/public-profile'
import { publicChefProfileConfig } from '../../../../user/server/projection/kitchen-profile'

export default createPublicProfileDetailHandler(publicChefProfileConfig)
