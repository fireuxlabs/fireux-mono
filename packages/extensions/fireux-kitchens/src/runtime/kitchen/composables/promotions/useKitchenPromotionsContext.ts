import {
  computed,
  inject,
  provide,
  shallowRef,
  watch,
  type InjectionKey,
} from 'vue'
import { useKitchenWorkspacePromotions } from '../workspace/promotions/useKitchenWorkspacePromotions'
import type { KitchenPromotion } from '../../models/promotion.model'

type PromotionEditorSession = { key: string; promotion?: KitchenPromotion }

function createKitchenPromotionsContext() {
  const state = useKitchenWorkspacePromotions()
  const editor = shallowRef<PromotionEditorSession | null>(null)
  const settled = computed(
    () =>
      state.identity.outcome.value === 'ready' &&
      ['ready', 'empty'].includes(state.collection.outcome.value) &&
      ['ready', 'empty'].includes(state.dishes.outcome.value)
  )
  const readError = computed(
    () =>
      (state.identity.outcome.value === 'error'
        ? 'Kitchen could not be loaded.'
        : null) ||
      state.collection.error.value ||
      state.dishes.error.value
  )
  const editorMissing = computed(() =>
    Boolean(
      editor.value?.promotion &&
        settled.value &&
        !state.collection.items.value.some(
          (promotion) => promotion.id === editor.value?.promotion?.id
        )
    )
  )
  const canCreate = computed(() => state.canWrite.value && settled.value)
  const canSave = computed(() => canCreate.value && !editorMissing.value)
  const editorPending = computed(() => !readError.value && !settled.value)
  function closeEditor() {
    editor.value = null
  }
  function createPromotion() {
    if (canCreate.value) editor.value = { key: 'new' }
  }
  function editPromotion(promotion: KitchenPromotion) {
    if (!canCreate.value) return
    editor.value = {
      key: promotion.id,
      promotion: JSON.parse(JSON.stringify(promotion)),
    }
  }
  watch(state.editorOwnerKey, closeEditor, { flush: 'sync' })
  return {
    state,
    editor,
    canCreate,
    canSave,
    editorPending,
    editorMissing,
    readError,
    createPromotion,
    editPromotion,
    closeEditor,
  }
}

type KitchenPromotionsContext = ReturnType<
  typeof createKitchenPromotionsContext
>
const key: InjectionKey<KitchenPromotionsContext> = Symbol('KitchenPromotions')

export function provideKitchenPromotionsContext() {
  const context = createKitchenPromotionsContext()
  provide(key, context)
  return context
}

export function useKitchenPromotionsContext() {
  const context = inject(key)
  if (!context) throw new Error('Promotions requires its workspace provider.')
  return context
}
