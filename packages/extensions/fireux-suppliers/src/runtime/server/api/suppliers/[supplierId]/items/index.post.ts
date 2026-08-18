import { defineEventHandler, getRouterParam, readBody } from 'h3'
import { createSupplierItem } from '../../../../../supplier/server/operations/items/item'

export default defineEventHandler(async event =>
  createSupplierItem(
    event,
    String(getRouterParam(event, 'supplierId') || ''),
    await readBody(event)
  )
)
