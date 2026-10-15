import {
  onMounted,
  inject,
  provide,
  ref,
  watch,
  type InjectionKey,
  type Ref,
} from 'vue'
import type { MenuRecordView } from './useMenuRecordNavigation'

type MenuViewContext = {
  view: Ref<MenuRecordView>
  select: (view: MenuRecordView) => void
}
const key: InjectionKey<MenuViewContext> = Symbol.for('KitchenMenuRecordView')

/** Owned by the mounted Menu record; reset when its account, Kitchen or record changes. */
export function provideMenuRecordView(
  scope: Ref<string>,
  menu: Ref<{ id: string; schedule?: string } | null>,
  consume: () => MenuRecordView | null,
  clear: () => void = () => {}
) {
  const view = ref<MenuRecordView>('content')
  const mounted = ref(false)
  onMounted(() => {
    mounted.value = true
  })
  let recordId = ''
  watch(
    scope,
    () => {
      recordId = ''
      view.value = 'content'
    },
    { flush: 'sync' }
  )
  watch(
    [scope, menu, mounted],
    () => {
      if (!menu.value || menu.value.id === recordId) return
      // Nuxt may mount a record more than once during a page transition.
      // The route-entry intent survives until leaving or choosing a local view.
      if (mounted.value) recordId = menu.value.id
      view.value = (mounted.value ? consume() : null) ?? 'content'
    },
    { immediate: true, flush: 'sync' }
  )
  const context = {
    view,
    select: (next: MenuRecordView) => {
      clear()
      view.value = next
    },
  }
  provide(key, context)
  return context
}

export function useMenuRecordView() {
  const context = inject(key)
  if (!context) throw new Error('Menu record view is not available')
  return context
}
