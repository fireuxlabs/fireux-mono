import { defineEventHandler } from 'h3'
import { updateUserProfile } from '../../../../user/server/profile/update'

export default defineEventHandler(updateUserProfile)
