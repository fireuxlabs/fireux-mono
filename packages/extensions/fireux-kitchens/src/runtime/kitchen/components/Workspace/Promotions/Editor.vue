<template>
  <UCard>
    <template #header
      ><h2 class="font-semibold">
        {{ promotion ? 'Edit promotion' : 'New promotion' }}
      </h2></template
    >
    <form class="space-y-5" @submit.prevent="save">
      <UFormField label="Promotion type">
        <USelect
          v-model="form"
          :items="[
            { label: 'Dish offer', value: 'dish_offer' },
            { label: 'Meal deal', value: 'meal_deal' },
          ]"
          class="w-full"
          :disabled="busy || !state.canWrite.value"
        />
      </UFormField>
      <UFormField label="Name"
        ><UInput
          v-model="name"
          class="w-full"
          :disabled="busy || !state.canWrite.value"
      /></UFormField>
      <div v-if="state.dishes.error.value" role="alert">
        <p>Food and drinks could not be loaded.</p>
        <MoleculesCopyError :message="String(state.dishes.error.value)" />
      </div>
      <WorkspaceKitchenPromotionsDishOffer
        v-if="form === 'dish_offer'"
        v-model="rows"
        :dish-options="dishOptions"
        :currency="state.currency.value"
        :disabled="busy || !state.canWrite.value || state.dishes.pending.value"
      />
      <WorkspaceKitchenPromotionsMealDeal
        v-else
        v-model:price="setPrice"
        v-model:groups="groups"
        :dish-options="dishOptions"
        :currency="state.currency.value"
        :disabled="busy || !state.canWrite.value || state.dishes.pending.value"
      />
      <fieldset>
        <legend class="mb-2 text-sm font-medium">Days</legend>
        <div class="flex flex-wrap gap-4">
          <UCheckbox
            v-for="day in promotionDays"
            :key="day"
            :label="day.charAt(0).toUpperCase() + day.slice(1)"
            :model-value="days.includes(day)"
            :disabled="busy || !state.canWrite.value"
            @update:model-value="(checked) => toggleDay(day, checked)"
          />
        </div>
      </fieldset>
      <UCheckbox
        v-model="active"
        label="Active"
        :disabled="busy || !state.canWrite.value"
      />
      <p class="text-sm text-muted">
        {{
          form === 'meal_deal'
            ? 'Set the meal-deal price, included choices and any supplements.'
            : 'Active dish offers appear on published Menus during these days, using the venue’s time and serving hours.'
        }}
        Normal Dish prices stay unchanged.
      </p>
      <div class="flex gap-3">
        <UButton
          type="submit"
          label="Save promotion"
          :loading="busy"
          :disabled="
            !state.canWrite.value ||
            busy ||
            Boolean(state.dishes.error.value) ||
            state.dishes.pending.value
          "
        />
        <UButton
          type="button"
          label="Cancel"
          color="neutral"
          variant="soft"
          :disabled="busy"
          @click="$emit('close')"
        />
      </div>
      <div v-if="error" role="alert">
        <p>{{ error }}</p>
        <MoleculesCopyError :message="error" />
      </div>
    </form>
  </UCard>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import type { KitchenPromotionsState } from '../../../composables/promotions/useKitchenPromotions'
import type { KitchenPromotion } from '../../../models/promotion.model'
import type {
  PromotionDishDraft,
  MealDealGroupDraft,
} from '../../../models/promotion-draft.model'
import type { WeekdayTimeDay } from '../../../../models/shared/weekday-time.model'
import {
  promotionDays,
  normalizeKitchenPromotion,
} from '../../../utils/promotions/pricing'
const props = defineProps<{
  state: KitchenPromotionsState
  promotion?: KitchenPromotion
}>()
const emit = defineEmits<{ close: [] }>()
const initial = props.promotion
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
  props.state.dishes.items.value
    .map((dish) => ({ label: dish.name, value: dish.id }))
    .sort((a, b) => a.label.localeCompare(b.label))
)
function toggleDay(day: WeekdayTimeDay, checked: boolean | 'indeterminate') {
  days.value =
    checked === true
      ? [...days.value.filter((value) => value !== day), day]
      : days.value.filter((value) => value !== day)
}
function amount(value: string | number) {
  if (!/^\d+(?:\.\d{1,2})?$/.test(String(value)))
    throw new Error('Enter an amount with at most two decimal places.')
  return Number(value)
}
async function save() {
  if (busy.value || !props.state.canWrite.value) return
  const current = props.state.captureIntent()
  busy.value = true
  error.value = ''
  try {
    const content =
      form.value === 'meal_deal'
        ? {
            price: amount(setPrice.value),
            groups: groups.value.map((group) => ({
              ...group,
              choose: String(group.choose).trim() ? Number(group.choose) : NaN,
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
      currency: props.state.currency.value,
      days: days.value,
      ...content,
    })
    await props.state.save(promotion, initial?.id)
    if (current()) emit('close')
  } catch (cause) {
    if (current())
      error.value =
        cause instanceof Error ? cause.message : 'Could not save promotion.'
  } finally {
    if (current()) busy.value = false
  }
}
</script>
