import { defineEventHandler, getRouterParam, readBody } from 'h3'
import { customerAction } from '../../../menu-express/customer'
import { operatorAction } from '../../../menu-express/operator'
export default defineEventHandler(async (event) => {
  const input = await readBody(event)
  return input.operator === true
    ? operatorAction(event, getRouterParam(event, 'id'), input)
    : customerAction(event, getRouterParam(event, 'id'), input)
})
