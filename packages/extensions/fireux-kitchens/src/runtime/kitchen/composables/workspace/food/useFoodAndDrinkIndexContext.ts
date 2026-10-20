import { inject, provide, type InjectionKey } from 'vue'
import { useFoodAndDrinkIndex } from './useFoodAndDrinkIndex'

type FoodAndDrinkIndex = ReturnType<typeof useFoodAndDrinkIndex>
const indexKey: InjectionKey<FoodAndDrinkIndex> = Symbol('FoodAndDrinkIndex')

export function provideFoodAndDrinkIndex() {
  const index = useFoodAndDrinkIndex()
  provide(indexKey, index)
}

/** Children share the mounted index; they never acquire another overview. */
export function useFoodAndDrinkIndexContext() {
  const index = inject(indexKey)
  if (!index) throw new Error('Food & drink children require their index provider.')
  return index
}
