<template>
  <section :aria-label="`${catalogue.title} selector`">
    <UTabs
      v-if="state.dishes.length"
      :model-value="state.selectedItemId"
      :items="items"
      :content="false"
      variant="link"
      size="sm"
      @update:model-value="actions.select(String($event))"
    />
    <UButton
      v-if="derived.capability.primitives.create.available"
      icon="i-lucide-plus"
      color="neutral"
      variant="soft"
      size="sm"
      :aria-label="`Create ${subject}`"
      @click="createOpen = true"
    />

    <UModal
      v-model:open="createOpen"
      :title="`Create ${subject}`"
      :description="`Add a ${catalogue.singular} to this Kitchen.`"
    >
      <template #body><KitchenMenuItemsCreate v-if="createOpen" /></template>
    </UModal>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useKitchenItemsContext } from '../../../composables/workspace/items/useKitchenItemsContext'

const { state, derived, actions, catalogue } = useKitchenItemsContext()
const createOpen = ref(false)
const subject = computed(() => derived.value.capability.subject)
const items = computed(() =>
  state.value.dishes.map((dish) => ({
    label: dish.name || dish.id,
    value: dish.id,
  }))
)
</script>
