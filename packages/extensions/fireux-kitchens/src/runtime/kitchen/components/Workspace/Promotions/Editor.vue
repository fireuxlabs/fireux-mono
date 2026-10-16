<template>
  <UCard>
    <template #header
      ><h2 class="font-semibold">
        {{ promotion ? 'Edit promotion' : 'New price offer' }}
      </h2></template
    >
    <form class="space-y-4" @submit.prevent="save">
      <UFormField label="Name"
        ><UInput v-model="name" class="w-full" :disabled="busy"
      /></UFormField>
      <UFormField label="Menu"
        ><USelect
          v-model="menuId"
          :items="menuOptions"
          class="w-full"
          :disabled="busy"
      /></UFormField>
      <UFormField
        label="Sections"
        description="Leave empty to include the whole Menu."
        ><USelect
          v-model="sectionIds"
          multiple
          placeholder="All items in this Menu"
          :items="sectionOptions"
          class="w-full"
          :disabled="busy || sections.pending.value"
      /></UFormField>
      <div v-if="sections.error.value" role="alert">
        <p>Menu sections could not be loaded.</p>
        <MoleculesCopyError :message="String(sections.error.value)" />
      </div>
      <UFormField :label="`Price per item (${state.currency.value})`"
        ><UInput
          v-model="amount"
          type="number"
          min="0.01"
          step="0.01"
          :disabled="busy"
      /></UFormField>
      <fieldset>
        <legend class="mb-2 text-sm font-medium">Days</legend>
        <div class="flex flex-wrap gap-4">
          <UCheckbox
            v-for="day in promotionDays"
            :key="day"
            :label="day.charAt(0).toUpperCase() + day.slice(1)"
            :model-value="days.includes(day)"
            :disabled="busy"
            @update:model-value="(checked) => toggleDay(day, checked)"
          />
        </div>
      </fieldset>
      <UCheckbox v-model="active" label="Active" :disabled="busy" />
      <p class="text-sm text-muted">
        Active offers appear on published Menus during these days, using the
        venue’s time and existing serving hours. Normal prices and extras stay
        unchanged.
      </p>
      <div class="flex gap-3">
        <UButton
          type="submit"
          label="Save promotion"
          :loading="busy"
          :disabled="
            !state.canWrite.value || busy || Boolean(sections.error.value)
          "
        /><UButton
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
import { computed, ref, watch } from 'vue'
import type { KitchenPromotionsState } from '../../../composables/promotions/useKitchenPromotions'
import type { KitchenPromotion } from '../../../models/promotion.model'
import type { WeekdayTimeDay } from '../../../../models/shared/weekday-time.model'
import {
  promotionDays,
  normalizeKitchenPromotion,
} from '../../../utils/promotions/pricing'
import { useKitchenChildCollection } from '../../../composables/useKitchenChildCollection'
const props = defineProps<{
  state: KitchenPromotionsState
  promotion?: KitchenPromotion
}>()
const emit = defineEmits<{ close: [] }>()
const name = ref(props.promotion?.name || '')
const menuId = ref(props.promotion?.menu_id || '')
const sectionIds = ref<string[]>([...(props.promotion?.section_ids || [])])
const amount = ref(
  props.promotion ? String(props.promotion.amount_minor / 100) : ''
)
const days = ref<WeekdayTimeDay[]>([...(props.promotion?.days || [])])
const active = ref(props.promotion?.status === 'active')
const busy = ref(false),
  error = ref('')
const menuOptions = computed(() =>
  props.state.menus.menus.value
    .filter(
      (menu) =>
        menu.schedule !== 'daily' &&
        menu.format !== 'document' &&
        !menu.doc?.url &&
        menu.status !== 'archived'
    )
    .map((menu) => ({ label: menu.name, value: menu.id }))
)
const path = computed(() =>
  menuId.value ? `menus/${menuId.value}/sections` : ''
)
const sections = useKitchenChildCollection<{
  id: string
  label: string
  status?: string
}>(path, props.state.kitchenId, { kitchenCollectionPath: 'kitchens' })
const sectionOptions = computed(() => [
  ...sections.items.value
    .filter((section) => section.status !== 'archived')
    .map((section) => ({ label: section.label, value: section.id })),
])
watch(menuId, () => {
  sectionIds.value = []
})
function toggleDay(day: WeekdayTimeDay, checked: boolean | 'indeterminate') {
  days.value =
    checked === true
      ? [...days.value.filter((value) => value !== day), day]
      : days.value.filter((value) => value !== day)
}
async function save() {
  if (busy.value || !props.state.canWrite.value) return
  const current = props.state.captureIntent()
  busy.value = true
  error.value = ''
  try {
    if (
      !/^\d+(?:\.\d{1,2})?$/.test(String(amount.value)) ||
      Number(amount.value) <= 0
    )
      throw new Error('Enter a positive price with at most two decimal places.')
    const promotion = normalizeKitchenPromotion({
      kind: 'fixed_price',
      name: name.value,
      status: active.value ? 'active' : 'paused',
      menu_id: menuId.value,
      section_ids: sectionIds.value,
      currency: props.state.currency.value,
      amount_minor: Math.round(Number(amount.value) * 100),
      days: days.value,
    })
    await props.state.save(promotion, props.promotion?.id)
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
