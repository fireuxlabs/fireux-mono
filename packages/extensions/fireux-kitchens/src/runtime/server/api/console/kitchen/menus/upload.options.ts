import { defineEventHandler, setResponseStatus } from 'h3'
import { setKitchenMenuUploadCors } from '../../../../utils/menu/source/uploads'

export default defineEventHandler((event) => {
  setKitchenMenuUploadCors(event, 'POST')
  setResponseStatus(event, 204)
  return null
})
