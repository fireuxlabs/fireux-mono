<template>
  <div v-if="section && canWrite">
    <UButton label="Add items" icon="i-lucide-plus" @click="open = true" />
    <UModal v-model:open="open" title="Add items" :description="section.label">
      <template #body>
        <div class="space-y-4">
          <UTabs
            v-model="mode"
            :items="modes"
            :content="false"
            aria-label="Add item type"
          />
          <KitchenFoodAndDrinkMenusItemsAddRepertoire
            v-if="mode === 'catalogue'"
          />
          <KitchenFoodAndDrinkMenusItemsAddByName v-else-if="mode === 'new'" />
          <KitchenFoodAndDrinkMenusItemsAddMealDeal v-else />
        </div>
      </template>
    </UModal>
  </div>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import { useMenuSection } from '../../../../../../menu/composables/useMenuSection'
import { useMenuEditorScope } from '../../../../../../menu/composables/useMenuEditorScope'
const { section, menu, canWrite, kitchenId, menuId, sectionId } =
  useMenuSection()
const open = ref(false),
  mode = ref('catalogue')
const modes = computed(() => [
  { label: 'Food & drinks', value: 'catalogue' },
  { label: 'New dishes', value: 'new' },
  ...(menu.value?.schedule !== 'daily'
    ? [{ label: 'Meal deals', value: 'deal' }]
    : []),
])
useMenuEditorScope([kitchenId, menuId, sectionId], () => {
  open.value = false
  mode.value = 'catalogue'
})
</script>
