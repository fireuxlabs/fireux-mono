import { defineEventHandler, getRouterParam, readBody } from 'h3'
import { updateSupplierItem } from '../../../../supplier/item'

export default defineEventHandler(async event =>
  updateSupplierItem(
    event,
    String(getRouterParam(event, 'supplierId') || ''),
    String(getRouterParam(event, 'itemId') || ''),
    await readBody(event)
  )
)
