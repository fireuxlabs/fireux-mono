import { createPublicProfileCollectionHandler } from 'fireux-core/runtime/server/utils/public-projection/public-profile'
import { publicChefProfileConfig } from '../../utils/public-profile/kitchen-profile'

export default createPublicProfileCollectionHandler(publicChefProfileConfig)
