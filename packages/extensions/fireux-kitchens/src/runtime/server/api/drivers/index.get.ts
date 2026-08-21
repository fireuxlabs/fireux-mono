import { createProfileDirectoryHandler } from 'fireux-core/runtime/user/server/directory/profile-directory'
import { driverProfileDirectory } from '../../../user/server/projection/kitchen-profile'

export default createProfileDirectoryHandler(driverProfileDirectory)
