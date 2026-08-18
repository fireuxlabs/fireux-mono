import { defineEventHandler, getRouterParam } from 'h3'
import { deleteSupplierItem } from '../../../../supplier/operations/items/item'

export default defineEventHandler(event =>
  deleteSupplierItem(
    event,
    String(getRouterParam(event, 'supplierId') || ''),
    String(getRouterParam(event, 'itemId') || '')
  )
)
