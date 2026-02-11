export const MenuSimple = {
  id: '' as string,
  name: '' as string,
  dish_ids: [] as string[],
} as const

export type MenuSimple = {
  [K in keyof typeof MenuSimple]: (typeof MenuSimple)[K]
}
