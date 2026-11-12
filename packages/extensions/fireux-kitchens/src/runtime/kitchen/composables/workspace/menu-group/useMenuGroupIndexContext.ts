import { inject, provide, type InjectionKey } from 'vue'
import { useMenuGroupIndex } from './useMenuGroupIndex'

type MenuGroupIndex = ReturnType<typeof useMenuGroupIndex>
const indexKey: InjectionKey<MenuGroupIndex> = Symbol('MenuGroupIndex')

export function provideMenuGroupIndex(
  ...args: Parameters<typeof useMenuGroupIndex>
) {
  const index = useMenuGroupIndex(...args)
  provide(indexKey, index)
  return index
}

/** Children share the mounted index; they never acquire another overview. */
export function useMenuGroupIndexContext() {
  const index = inject(indexKey)
  if (!index)
    throw new Error('Food & drink children require their index provider.')
  return index
}
