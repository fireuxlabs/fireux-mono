import { createPublicProfileCollectionHandler } from 'fireux-core/runtime/server/utils/public-projection/public-profile'
import { publicProfessionalProfileConfig } from '../../utils/public-profile/jobs-profile'

export default createPublicProfileCollectionHandler(publicProfessionalProfileConfig)
