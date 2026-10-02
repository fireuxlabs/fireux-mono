import { defineEventHandler, readBody } from 'h3'
import { createPortfolioTask } from '../../../../../portfolio/server/tasks/commands'
export default defineEventHandler(async event => createPortfolioTask(event, await readBody(event)))
