import { inject, provide, type InjectionKey } from 'vue'
import type { useKitchenItemRead } from './useKitchenItemRead'
type KitchenItemContext = ReturnType<typeof useKitchenItemRead>
const key: InjectionKey<KitchenItemContext> = Symbol('KitchenItemContext')
/** The routed detail owns acquisition; editors and relationships share its live scope. */
export function provideKitchenItemContext(reader: KitchenItemContext) {
  provide(key, reader)
  return reader
}
export function useKitchenItemContext() {
  const reader = inject(key)
  if (!reader)
    throw new Error('Item editor requires its Item context provider.')
  return reader
}
