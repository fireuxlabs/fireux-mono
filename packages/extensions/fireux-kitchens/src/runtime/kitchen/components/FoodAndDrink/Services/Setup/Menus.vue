<template>
  <UFormField label="Menus">
    <FireStateCard
      v-if="outcome === 'idle' || outcome === 'pending'"
      entity="Menus"
      loading
    />
    <FireStateCard
      v-else-if="outcome === 'error'"
      entity="Menus"
      state="error"
    />
    <FireMultiSelect
      v-else-if="options.length"
      label="Menus"
      :model-value="menuIds"
      :items="options"
      :disabled="disabled"
      @update:model-value="emit('update', $event)"
    />
    <p v-else class="text-sm text-muted">Create a menu to get started.</p>
    <p
      v-for="option in unavailable"
      :key="option.value"
      class="mt-2 text-sm text-warning"
      role="status"
    >
      {{ option.label }}: {{ option.description }}
    </p>
  </UFormField>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import type { Menu } from '../../../../../menu/models/menu.model'
import type { ReadOutcome } from 'fireux-core/runtime/composables/fireux/firestore/operations/read-outcome'
import {
  isServiceMenu,
  serviceMenuOptions,
} from '../../../../utils/service-menus'
const props = defineProps<{
  menuIds: string[]
  menus: Menu[]
  outcome: ReadOutcome
  disabled?: boolean
}>()
const emit = defineEmits<{ update: [values: unknown[]] }>()
const options = computed(() => serviceMenuOptions(props.menus, props.menuIds))
const unavailable = computed(() =>
  options.value.filter(
    (option) =>
      props.menuIds.includes(option.value) &&
      !isServiceMenu(
        props.menus.find((menu) => menu.id === option.value) || {
          status: 'archived',
        }
      )
  )
)
</script>
