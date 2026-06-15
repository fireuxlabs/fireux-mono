import { defineEventHandler, type H3Event } from 'h3'
import {
  assertKitchenMenuUploadAccess,
  kitchenMenuUploadExists,
  readKitchenMenuUploadAvailabilityRequest,
  requireKitchenMenuUploadUser,
  setKitchenMenuUploadCors,
} from '../../../../../utils/kitchen-menu-uploads'

export default defineEventHandler(async (event: H3Event) => {
  setKitchenMenuUploadCors(event, 'GET')

  const request = readKitchenMenuUploadAvailabilityRequest(event)
  if (!request.isValid) return request.response

  const uid = await requireKitchenMenuUploadUser(
    event,
    'Sign in before checking a menu upload path.'
  )
  await assertKitchenMenuUploadAccess(request.appId, request.kitchenId, uid)

  const taken = await kitchenMenuUploadExists(
    request.appId,
    request.kitchenId,
    request.uploadId
  )

  return {
    id: request.uploadId,
    is_valid: true,
    taken,
    available: !taken,
  }
})
