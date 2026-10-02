import { defineEventHandler, readBody } from 'h3'
import { updatePortfolioIdentity } from '../../../../portfolio/server/identity/update'
export default defineEventHandler(async event => updatePortfolioIdentity(event, await readBody(event)))
