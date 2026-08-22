export const CustomerOrderLinkStorage = {
  shape: 'child',
  path: 'users/{userId}/orders/{orderId}',
  collection: 'orders',
  parent: 'user',
  idParam: 'orderId',
} as const
