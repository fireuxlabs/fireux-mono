import { defineEventHandler, readBody } from 'h3'
import { answerFoodOverview } from '../../../../../kitchen/server/food/answer'
export default defineEventHandler(async (event) =>
  answerFoodOverview(event, await readBody(event))
)
