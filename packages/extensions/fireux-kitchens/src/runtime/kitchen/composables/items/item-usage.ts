export type ItemUsage = {
  kind: 'menu' | 'promotion'
  id: string
  name: string
  section?: string
  to: string
}
export type ItemUsageResponse = {
  kitchenId: string
  dishId: string
  usages: ItemUsage[]
}
