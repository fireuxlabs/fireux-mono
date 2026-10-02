import { defineEventHandler, readBody } from 'h3'
import { linkPortfolioDocument } from '../../../../../portfolio/server/documents/link'
export default defineEventHandler(async event => linkPortfolioDocument(event, await readBody(event)))
