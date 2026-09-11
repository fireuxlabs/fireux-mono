import { defineLiveReadHandler } from 'fireux-core/runtime/server/utils/http/defineLiveReadHandler'
import { readCustomerOrders } from '../../../user/server/customer/orders/read'

export default defineLiveReadHandler(readCustomerOrders)
