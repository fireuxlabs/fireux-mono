import { defineEventHandler } from 'h3'
import { updateUserAvatar } from '../../../../user/server/avatar/update'

export default defineEventHandler(updateUserAvatar)
