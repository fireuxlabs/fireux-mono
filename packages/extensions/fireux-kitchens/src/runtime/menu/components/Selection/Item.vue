<template>
  <div>
    <MenuItemImage
      :enabled="offer.presentation.showItemImages"
      :image-url="offer.item.imageUrl"
    />
    <p v-if="offer.item.description">
      {{ offer.item.description }}
    </p>
    <MenuSelectionBottle
      v-if="offer.item.bottleDeposit"
      v-model="choices.bottle"
      :deposit="offer.item.bottleDeposit"
      :money="money"
    />
    <MenuItemChoices
      :groups="choiceGroups"
      :model-value="selectedGroups"
      :money="money"
      :show-names="offer.item.choiceGroups !== undefined"
      @update:model-value="updateGroups"
    />
    <UFormField
      v-for="group in offer.item.mealDeal?.groups || []"
      :key="group.id"
      :label="`${group.name} · choose ${group.choose}`"
      required
    >
      <FireMultiSelect
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
    <div>
      <UFormField label="Quantity">
        <UInput
          :model-value="choices.quantity"
          @update:model-value="choices.quantity = Number($event)"
          type="number"
          min="1"
          max="99"
          step="1"
        />
      </UFormField>
      <span>{{
        preview.line
          ? money((preview.line.unitMinor * choices.quantity) / 100)
          : money(offer.item.price)
      }}</span>
    </div>
    <p v-if="preview.issue" role="status">
      {{ preview.issue }}
    </p>
    <p v-if="error" role="alert">{{ error }}</p>
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
import { readItemChoiceGroups } from '../../../kitchen/utils/item-choices'
import type { ItemChoiceSelection } from '../../../kitchen/models/item-choice.model'
import type { MenuServiceOffer } from '../../utils/ordering/sections'
import {
  serviceBasketLine,
  type ServiceItemChoices,
} from '../../utils/ordering/basket'
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
const choiceGroups = computed(() => readItemChoiceGroups(props.offer.item))
const selectedGroups = computed(() =>
  props.offer.item.choiceGroups !== undefined
    ? choices.choiceGroups || {}
    : {
        'legacy-variants': choices.optionId ? [choices.optionId] : [],
        'legacy-extras': choices.extraIds,
      }
)
function updateGroups(value: ItemChoiceSelection) {
  if (props.offer.item.choiceGroups !== undefined) choices.choiceGroups = value
  else {
    choices.optionId = value['legacy-variants']?.[0] || ''
    choices.extraIds = value['legacy-extras'] || []
  }
}
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
