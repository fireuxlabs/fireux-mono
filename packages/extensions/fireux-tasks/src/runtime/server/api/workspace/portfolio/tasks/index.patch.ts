import { defineEventHandler, readBody } from 'h3'
import { updatePortfolioTask } from '../../../../../portfolio/server/tasks/commands'
export default defineEventHandler(async event => updatePortfolioTask(event, await readBody(event)))
