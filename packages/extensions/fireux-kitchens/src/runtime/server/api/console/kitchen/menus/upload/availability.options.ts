import { defineEventHandler, setResponseStatus } from 'h3'
import { setKitchenMenuUploadCors } from '../../../../../utils/kitchen-menu-uploads'

export default defineEventHandler((event) => {
  setKitchenMenuUploadCors(event, 'GET')
  setResponseStatus(event, 204)
  return null
})
