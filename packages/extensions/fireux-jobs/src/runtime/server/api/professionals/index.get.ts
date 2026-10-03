import { createProfileDirectoryHandler } from 'fireux-core/runtime/user/server/directory/profile-directory'
import { professionalProfileDirectory } from '../../../user/server/directory/jobs-profile'

export default createProfileDirectoryHandler(professionalProfileDirectory)
