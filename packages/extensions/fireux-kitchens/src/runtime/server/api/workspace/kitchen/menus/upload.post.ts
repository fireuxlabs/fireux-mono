import { defineEventHandler } from 'h3'
import {
  readKitchenMenuUploadRequest,
  requireKitchenMenuUploadUser,
  setKitchenMenuUploadCors,
} from '../../../../../menu/server/source/uploads'
import { saveKitchenMenuSource } from '../../../../../menu/server/source/save'
export default defineEventHandler(async (event) => {
  setKitchenMenuUploadCors(event, 'POST')
  const uid = await requireKitchenMenuUploadUser(event)
  return saveKitchenMenuSource(await readKitchenMenuUploadRequest(event), uid)
})
