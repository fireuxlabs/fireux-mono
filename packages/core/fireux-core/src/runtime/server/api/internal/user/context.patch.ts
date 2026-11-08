import { defineEventHandler } from 'h3'
import { updateUserContext } from '../../../../user/server/context/update'

export default defineEventHandler(updateUserContext)
