import { defineEventHandler, readBody } from 'h3'
import { createDish } from '../../../../../kitchen/server/dishes/commands'
export default defineEventHandler(async event => createDish(event, await readBody(event)))
