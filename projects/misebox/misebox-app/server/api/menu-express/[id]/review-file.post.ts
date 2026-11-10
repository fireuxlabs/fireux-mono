import { defineEventHandler, getRouterParam, readBody } from 'h3'
import { readReviewFile } from '../../../menu-express/review-file'

export default defineEventHandler(async (event) =>
  readReviewFile(event, getRouterParam(event, 'id'), await readBody(event))
)
