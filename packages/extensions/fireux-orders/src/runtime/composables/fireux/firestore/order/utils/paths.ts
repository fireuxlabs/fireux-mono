import { OrderStorage } from '../../../../../models/order.model'

const clean = (value: unknown) => String(value ?? '').trim()

export const orderCollectionPath = () => OrderStorage.collection

export const orderPath = (orderId: unknown) => {
  const id = clean(orderId)
  return id ? `${OrderStorage.collection}/${id}` : ''
}
