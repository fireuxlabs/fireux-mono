export type KitchenLandingIntent = {
  action: 'none' | 'read' | 'create' | 'update' | 'open'
  target: string
  message: string
}

export const kitchenLandingDestinations = {
  menus: '/workspace/kitchen/menus',
  orders: '/workspace/kitchen/orders',
  recipes: '/workspace/kitchen/food/recipes',
  team: '/workspace/kitchen/team',
  identity: '/workspace/kitchen/identity',
  overview: '/workspace/kitchen/overview',
} as const
