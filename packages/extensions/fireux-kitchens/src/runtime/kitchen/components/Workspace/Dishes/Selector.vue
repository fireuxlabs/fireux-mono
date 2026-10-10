<template>
  <section
    class="flex items-center gap-2"
    :aria-label="`${catalogue.title} selector`"
  >
    <UTabs
      v-if="state.dishes.length"
      :model-value="state.selectedDishId"
      :items="items"
      :content="false"
      variant="link"
      size="sm"
      class="w-fit max-w-full"
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
      :ui="{ content: 'sm:max-w-3xl' }"
    >
      <template #body
        ><WorkspaceKitchenDishesWrite v-if="createOpen"
      /></template>
    </UModal>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useKitchenDishesContext } from '../../../composables/workspace/dishes/useKitchenDishesContext'

const { state, derived, actions, catalogue } = useKitchenDishesContext()
const createOpen = ref(false)
const subject = computed(() => derived.value.capability.subject)
const items = computed(() =>
  state.value.dishes.map((dish) => ({
    label: dish.name || dish.id,
    value: dish.id,
  }))
)
</script>
