<template>
  <div class="workspace-surface workspace-surface--compact">
    <h2 class="fx-type-card-heading">New items</h2>
    <div class="workspace-surface workspace-surface--compact">
      <UTextarea
        v-model="names"
        aria-label="Item names"
        :disabled="busy || !canWrite"
        placeholder="One Item per line"
      />
      <p class="fx-type-caption">
        Matching Kitchen Items are reused. New names create shared Items and add
        them to this section.
      </p>
      <FireState
        v-if="!catalogueReady"
        :outcome="catalogueOutcome"
        entity="Items"
        :error="catalogueError"
      />
      <UFormField
        v-for="name in newNames"
        :key="name"
        :label="`${name} · Normal price`"
        required
      >
        <!-- @vue-generic {string | number, {}} -->
        <UInput
          v-model="prices[name]"
          type="number"
          min="0"
          step="0.01"
          :aria-label="`${name} normal price`"
          :disabled="busy || !canWrite"
        />
      </UFormField>
      <UButton
        label="Add listed items"
        :loading="busy"
        :disabled="busy || !names.trim() || !canWrite || !catalogueReady"
        @click="addNames"
      />
    </div>
    <FireCopyError v-if="error" :message="error" />
  </div>
</template>
<script setup lang="ts">
import { useRoute } from '#imports'
import { useMenuSection } from '../../../../../../menu/composables/useMenuSection'
import { useMenuSectionDishCreation } from '../../../../../composables/workspace/menus/useMenuSectionDishCreation'
const route = useRoute()
const {
  names,
  prices,
  newNames,
  error,
  busy,
  canWrite,
  catalogueReady,
  catalogueOutcome,
  catalogueError,
  addNames,
} = useMenuSectionDishCreation(useMenuSection(), () => route.fullPath)
</script>
