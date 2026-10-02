import { defineEventHandler, readBody } from 'h3'
import { createInteractiveProduct } from '../../../product/server/create/command'
export default defineEventHandler(async event => createInteractiveProduct(event, await readBody(event)))
