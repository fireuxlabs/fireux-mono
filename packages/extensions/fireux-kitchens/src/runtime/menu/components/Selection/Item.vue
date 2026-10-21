<template>
  <div class="space-y-6">
    <MenuItemImage
      :enabled="offer.presentation.showItemImages"
      :image-url="offer.item.imageUrl"
    />
    <p v-if="offer.item.description" class="text-sm text-muted">
      {{ offer.item.description }}
    </p>
    <MenuSelectionBottle
      v-if="offer.item.bottleDeposit"
      v-model="choices.bottle"
      :deposit="offer.item.bottleDeposit"
      :money="money"
    />
    <UFormField
      v-if="offer.item.priceOptions.length"
      label="Choose an option"
      required
    >
      <URadioGroup v-model="choices.optionId" :items="options" />
    </UFormField>
    <UFormField v-if="offer.item.addOns.length" label="Extras">
      <MoleculesMultiSelect
        v-model="choices.extraIds"
        label="Extras"
        :items="extras"
      />
    </UFormField>
    <UFormField
      v-for="group in offer.item.mealDeal?.groups || []"
      :key="group.id"
      :label="`${group.name} · choose ${group.choose}`"
      required
    >
      <MoleculesMultiSelect
        :model-value="choices.groups[group.id] || []"
        :label="group.name"
        :items="
          group.dishes.map((dish) => ({
            value: dish.dishId,
            label:
              dish.name +
              (dish.supplement ? ` +${money(dish.supplement)}` : ''),
          }))
        "
        @update:model-value="choices.groups[group.id] = $event"
      />
    </UFormField>
    <div class="flex items-end justify-between gap-4">
      <UFormField label="Quantity">
        <UInput
          :model-value="choices.quantity"
          @update:model-value="choices.quantity = Number($event)"
          type="number"
          min="1"
          max="99"
          step="1"
          class="w-24"
        />
      </UFormField>
      <span class="text-lg font-semibold">{{
        preview.line
          ? money((preview.line.unitMinor * choices.quantity) / 100)
          : money(offer.item.price)
      }}</span>
    </div>
    <p v-if="preview.issue" class="text-sm text-muted" role="status">
      {{ preview.issue }}
    </p>
    <p v-if="error" class="text-sm text-error" role="alert">{{ error }}</p>
    <UButton
      :label="initialChoices ? 'Update basket' : 'Add to basket'"
      block
      size="lg"
      :disabled="!preview.line"
      @click="add"
    />
  </div>
</template>
<script setup lang="ts">
import { computed, reactive } from 'vue'
import type { MenuServiceOffer } from '../../utils/service-sections'
import {
  serviceBasketLine,
  type ServiceItemChoices,
} from '../../utils/service-basket'
const props = defineProps<{
  offer: MenuServiceOffer
  money: (value: number) => string
  error: string
  initialChoices?: ServiceItemChoices
}>()
const emit = defineEmits<{ add: [choices: ServiceItemChoices] }>()
const choices = reactive<ServiceItemChoices>(
  props.initialChoices
    ? JSON.parse(JSON.stringify(props.initialChoices))
    : { optionId: '', extraIds: [], groups: {}, quantity: 1 }
)
const options = computed(() =>
  props.offer.item.priceOptions.map((row) => ({
    value: row.id,
    label: `${row.label} · ${props.money(row.price)}`,
  }))
)
const extras = computed(() =>
  props.offer.item.addOns.map((row) => ({
    value: row.id,
    label: `${row.label} +${props.money(row.price)}`,
  }))
)
const preview = computed(() => {
  try {
    return { line: serviceBasketLine(props.offer, choices), issue: '' }
  } catch (error) {
    return {
      line: null,
      issue: error instanceof Error ? error.message : 'Review your selection.',
    }
  }
})
function add() {
  if (!preview.value.line) return
  emit('add', {
    ...choices,
    extraIds: [...choices.extraIds],
    groups: Object.fromEntries(
      Object.entries(choices.groups).map(([id, values]) => [id, [...values]])
    ),
  })
}
</script>
