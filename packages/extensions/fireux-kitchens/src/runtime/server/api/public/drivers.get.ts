import { createPublicProfileCollectionHandler } from 'fireux-core/runtime/server/utils/public-projection/public-profile.ts'
import { publicDriverProfileConfig } from '../../utils/public-profile/kitchen-profile'

export default createPublicProfileCollectionHandler(publicDriverProfileConfig)
