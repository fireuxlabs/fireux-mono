/** A proposed Menu control action, never mutation authority. */
export type KitchenMenusIntent = {
  action: 'none' | 'create' | 'read' | 'update' | 'delete'
  target: string
  message: string
}
