import { defineEventHandler, getRouterParam, readBody } from 'h3'
import { createSupplierItem } from '../../../../../supplier/server/items/commands'

export default defineEventHandler(async (event) =>
  createSupplierItem(
    event,
    String(getRouterParam(event, 'supplierId') || ''),
    await readBody(event)
  )
)
