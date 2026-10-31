import { defineEventHandler } from 'h3'
import { requireKitchenMenuUploadUser } from '../../../../../menu/server/source/uploads'
import { readKitchenMenuUrlSourceRequest } from '../../../../../menu/server/source/url-sources'
import { saveKitchenMenuSource } from '../../../../../menu/server/source/save'
export default defineEventHandler(async (event) => {
  const uid = await requireKitchenMenuUploadUser(event)
  return saveKitchenMenuSource(
    await readKitchenMenuUrlSourceRequest(event),
    uid
  )
})
