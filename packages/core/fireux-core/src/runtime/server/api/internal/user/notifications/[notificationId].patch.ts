import { defineEventHandler } from 'h3'
import { markUserNotificationRead } from '../../../../../user/server/notifications/mark-read'

export default defineEventHandler(markUserNotificationRead)
