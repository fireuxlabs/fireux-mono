import { defineEventHandler } from 'h3'
import { readCustomerOrders } from '../../../user/server/customer/orders/read'

export default defineEventHandler(readCustomerOrders)
