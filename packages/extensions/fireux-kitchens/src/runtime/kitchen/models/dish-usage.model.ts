export type DishUsage = {
  kind: 'menu' | 'promotion'
  id: string
  name: string
  section?: string
  to: string
}
export type DishUsageResponse = {
  kitchenId: string
  dishId: string
  usages: DishUsage[]
}
