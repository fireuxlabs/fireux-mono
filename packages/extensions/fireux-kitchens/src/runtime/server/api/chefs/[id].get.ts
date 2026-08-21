import { createProfileDetailHandler } from 'fireux-core/runtime/user/server/directory/profile-directory'
import { chefProfileDirectory } from '../../../user/server/projection/kitchen-profile'

export default createProfileDetailHandler(chefProfileDirectory)
