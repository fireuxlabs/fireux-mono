import { defineLiveReadHandler } from '../../../utils/http/defineLiveReadHandler'
import { readUserNotifications } from '../../../../user/server/notifications/read'

export default defineLiveReadHandler(readUserNotifications)
