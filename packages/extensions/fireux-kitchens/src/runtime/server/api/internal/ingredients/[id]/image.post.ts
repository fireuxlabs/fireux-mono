import { defineEventHandler, getRouterParam, setResponseHeader } from 'h3'
import { generateIngredientImage } from '../../../../../ingredient/server/image-generation'

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'private, no-store')
  return generateIngredientImage(event, getRouterParam(event, 'id') || '')
})
