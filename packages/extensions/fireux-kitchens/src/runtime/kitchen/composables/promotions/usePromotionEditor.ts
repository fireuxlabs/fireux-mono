import { computed, ref } from 'vue'
import type {
  PromotionDishDraft,
  MealDealGroupDraft,
} from '../../models/promotion-draft.model'
import type { WeekdayTimeDay } from '../../../models/shared/weekday-time.model'
import {
  promotionDays,
  normalizeKitchenPromotion,
} from '../../utils/promotions/pricing'
import { useKitchenPromotionsContext } from './useKitchenPromotionsContext'

export function usePromotionEditor() {
  const {
    state,
    editor,
    canSave,
    editorPending,
    editorMissing,
    readError,
    closeEditor,
  } = useKitchenPromotionsContext()
  const initial = editor.value?.promotion
  const form = ref<'dish_offer' | 'meal_deal'>(
    initial && 'groups' in initial ? 'meal_deal' : 'dish_offer'
  )
  const name = ref(initial?.name || '')
  const rows = ref<PromotionDishDraft[]>(
    initial && 'dishes' in initial
      ? initial.dishes.map((dish) => ({ ...dish }))
      : []
  )
  const setPrice = ref<string | number>(
    initial && 'groups' in initial ? initial.price : ''
  )
  const groups = ref<MealDealGroupDraft[]>(
    initial && 'groups' in initial
      ? initial.groups.map((group) => ({
          ...group,
          dishes: group.dishes.map((dish) => ({ ...dish })),
        }))
      : []
  )
  const days = ref<WeekdayTimeDay[]>([...(initial?.days || [])])
  const active = ref(initial?.status === 'active')
  const busy = ref(false),
    error = ref('')
  const dishOptions = computed(() =>
    state.dishes.items.value
      .map((dish) => ({ label: dish.name, value: dish.id }))
      .sort((a, b) => a.label.localeCompare(b.label))
  )
  function amount(value: string | number) {
    if (!/^\d+(?:\.\d{1,2})?$/.test(String(value)))
      throw new Error('Enter an amount with at most two decimal places.')
    return Number(value)
  }
  async function save() {
    if (busy.value || !canSave.value) return
    const current = state.captureIntent()
    busy.value = true
    error.value = ''
    try {
      const content =
        form.value === 'meal_deal'
          ? {
              price: amount(setPrice.value),
              groups: groups.value.map((group) => ({
                ...group,
                choose: String(group.choose).trim()
                  ? Number(group.choose)
                  : NaN,
                dishes: group.dishes.map((dish) => ({
                  dishId: dish.dishId,
                  supplement: amount(dish.supplement),
                })),
              })),
            }
          : {
              dishes: rows.value.map((row) => ({
                dishId: row.dishId,
                price: amount(row.price),
              })),
            }
      const promotion = normalizeKitchenPromotion({
        name: name.value,
        status: active.value ? 'active' : 'paused',
        currency: state.currency.value,
        days: days.value,
        ...content,
      })
      await state.save(promotion, initial?.id)
      if (current()) closeEditor()
    } catch (cause) {
      if (current())
        error.value =
          cause instanceof Error ? cause.message : 'Could not save promotion.'
    } finally {
      if (current()) busy.value = false
    }
  }

  const disabled = computed(() => busy.value || !canSave.value)
  const dayOptions = promotionDays.map((day) => ({
    value: day,
    label: day.charAt(0).toUpperCase() + day.slice(1),
  }))
  return {
    currency: state.currency,
    promotion: initial,
    form,
    name,
    rows,
    setPrice,
    groups,
    days,
    active,
    busy,
    error,
    dishOptions,
    disabled,
    dayOptions,
    readError,
    editorPending,
    editorMissing,
    closeEditor,
    save,
  }
}
