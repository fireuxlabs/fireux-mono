<template>
  <UFormField label="Menus">
    <FireState
      v-if="outcome === 'idle' || outcome === 'pending'"
      entity="Menus"
      outcome="pending"
    />
    <FireState v-else-if="outcome === 'error'" entity="Menus" outcome="error" />
    <FireMultiSelect
      v-else-if="options.length"
      label="Menus"
      :model-value="menuIds"
      :items="options"
      :disabled="disabled"
      @update:model-value="emit('update', $event)"
    />
    <p v-else>Create a menu to get started.</p>
    <p v-for="option in unavailable" :key="option.value" role="status">
      {{ option.label }}: {{ option.description }}
    </p>
  </UFormField>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import type { Menu } from '../../../../../menu/models/menu.model'
import type { ReadOutcome } from 'fireux-core/runtime/utils/read-outcome'
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
