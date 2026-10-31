<template>
  <div class="workspace-surface workspace-surface--compact">
    <h2 class="fx-type-card-heading">New dishes</h2>
    <div class="workspace-surface workspace-surface--compact">
      <UTextarea
        v-model="names"
        aria-label="Dish names"
        :disabled="busy || !canWrite"
        placeholder="One dish per line"
      />
      <p class="fx-type-caption">
        Matching kitchen dishes are reused. New names create dishes in your
        catalogue.
      </p>
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
        label="Add listed dishes"
        :loading="busy"
        :disabled="busy || !names.trim() || !canWrite"
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
const { names, prices, newNames, error, busy, canWrite, addNames } =
  useMenuSectionDishCreation(useMenuSection(), () => route.fullPath)
</script>
