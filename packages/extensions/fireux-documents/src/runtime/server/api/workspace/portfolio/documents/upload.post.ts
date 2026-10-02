import { defineEventHandler, readMultipartFormData } from 'h3'
import { readPortfolioMutationActor } from 'fireux-properties/runtime/portfolio/server/team/authority'
import { uploadPortfolioDocument } from '../../../../../portfolio/server/documents/upload'
export default defineEventHandler(async event => {
  const actor = await readPortfolioMutationActor(event)
  return uploadPortfolioDocument(event, await readMultipartFormData(event), actor)
})
