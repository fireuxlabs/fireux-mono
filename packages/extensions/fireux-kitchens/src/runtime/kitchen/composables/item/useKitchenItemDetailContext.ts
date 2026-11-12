import { inject, provide, type InjectionKey } from 'vue'
import type { useKitchenItemRecord } from './useKitchenItemRecord'
type KitchenItemDetail = ReturnType<typeof useKitchenItemRecord>
const key: InjectionKey<KitchenItemDetail> = Symbol('KitchenItemDetail')
/** The routed detail owns acquisition; editors and relationships share its live scope. */
export function provideKitchenItemDetail(detail: KitchenItemDetail) {
  provide(key, detail)
  return detail
}
export function useKitchenItemDetail() {
  const detail = inject(key)
  if (!detail) throw new Error('Item editor requires its detail provider.')
  return detail
}
