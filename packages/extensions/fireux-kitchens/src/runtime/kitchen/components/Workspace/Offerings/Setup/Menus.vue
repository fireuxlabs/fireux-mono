<template>
  <UFormField label="Menus">
    <MoleculesStateCard
      v-if="outcome === 'idle' || outcome === 'pending'"
      entity="Menus"
      loading
    />
    <MoleculesStateCard
      v-else-if="outcome === 'error'"
      entity="Menus"
      state="error"
    />
    <UCheckboxGroup
      v-else-if="options.length"
      :model-value="menuIds"
      :items="options"
      :disabled="disabled"
      class="mt-2"
      :ui="{ fieldset: 'flex flex-row flex-wrap gap-x-5 gap-y-3' }"
      @update:model-value="emit('update', $event)"
    />
    <p v-else class="my-2 text-sm text-muted">Create a menu to get started.</p>
  </UFormField>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import type { Menu } from '../../../../../menu/models/menu.model'
import type { ReadOutcome } from 'fireux-core/runtime/composables/fireux/firestore/operations/read-outcome'
import { serviceMenuOptions } from '../../../../utils/service-menus'
const props = defineProps<{
  menuIds: string[]
  menus: Menu[]
  outcome: ReadOutcome
  disabled?: boolean
}>()
const emit = defineEmits<{ update: [values: unknown[]] }>()
const options = computed(() => serviceMenuOptions(props.menus, props.menuIds))
</script>
