export type KitchenLandingIntent = {
  action: 'none' | 'read' | 'create' | 'update' | 'open'
  target: string
  message: string
}

export const kitchenLandingDestinations = {
  menus: '/workspace/kitchen/food-and-drink/menus',
  orders: '/workspace/kitchen/orders',
  recipes: '/workspace/kitchen/prep/recipes',
  team: '/workspace/kitchen/team',
  identity: '/workspace/kitchen/identity',
  overview: '/workspace/kitchen/overview',
} as const
