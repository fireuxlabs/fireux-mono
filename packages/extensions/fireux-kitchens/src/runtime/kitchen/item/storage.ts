/** Existing persisted path; code ownership does not rename stored records. */
export const ItemStorage = {
  shape: 'scoped',
  path: 'kitchens/{kitchenId}/dishes/{dishId}',
  collection: 'dishes',
  parent: 'kitchen',
  idParam: 'dishId',
} as const
