import { createProfileDetailHandler } from 'fireux-core/runtime/user/server/directory/profile-directory'
import { professionalProfileDirectory } from '../../utils/public-profile/jobs-profile'

export default createProfileDetailHandler(professionalProfileDirectory)
