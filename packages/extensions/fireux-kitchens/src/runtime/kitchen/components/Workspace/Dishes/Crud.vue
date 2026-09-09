<template>
  <div>
    <WorkspaceCrudToolbar
      :label="catalogue.title"
      :available="derived.capability.availableActions"
      @create="createOpen = true"
      @read="readOpen = true"
    />

    <UModal
      v-model:open="createOpen"
      :title="`Create ${subject}`"
      :description="`Add a ${catalogue.singular} to this Kitchen.`"
      :ui="{ content: 'sm:max-w-3xl' }"
    >
      <template #body><WorkspaceKitchenDishesWrite /></template>
    </UModal>

    <UModal
      v-model:open="readOpen"
      :title="catalogue.title"
      :description="`Read ${catalogue.plural} in this Kitchen.`"
      :ui="{ content: 'sm:max-w-4xl' }"
    >
      <template #body><WorkspaceKitchenDishesRead /></template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useKitchenDishesContext } from '../../../composables/workspace/dishes/useKitchenDishesContext'

const { derived, catalogue } = useKitchenDishesContext()
const createOpen = ref(false)
const readOpen = ref(false)
const subject = computed(() => derived.value.capability.subject)
</script>
