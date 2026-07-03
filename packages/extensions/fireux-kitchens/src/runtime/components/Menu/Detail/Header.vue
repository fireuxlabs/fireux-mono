<template>
  <header class="menu-header">
    <MenuDetailHeading
      :kitchen-name="menu.presentation.kitchenName"
      :name="menu.content.name"
      :description="menu.content.description"
    />

    <ClientOnly>
      <span
        class="menu-service-times-chip"
        :class="{
          'menu-service-times-chip--open': derivedMenuServiceTimes.open,
          'menu-service-times-chip--closed':
            derivedMenuServiceTimes.known && !derivedMenuServiceTimes.open,
          'menu-service-times-chip--unknown': !derivedMenuServiceTimes.known,
        }"
      >
        {{ derivedMenuServiceTimes.label }}
      </span>
    </ClientOnly>

    <MenuDetailChoiceToggle
      v-if="choices.length > 1"
      :model-value="modelValue"
      :options="choices"
      @update:model-value="$emit('update:modelValue', $event)"
    />
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type {
  MenuChoiceOption,
  MenuChoiceValue,
} from '../../../composables/fireux/kitchen/order/funnel/shared/useFunnel'
import type { MenuManifest } from '../../../composables/fireux/menu/useMenuManifest'
import { useMenuServiceComputed } from '../../../composables/fireux/firestore/menu/useMenu'

const props = defineProps<{
  menu: MenuManifest
  modelValue: MenuChoiceValue
  choices: MenuChoiceOption[]
}>()

defineEmits<{
  (event: 'update:modelValue', value: MenuChoiceValue): void
}>()

const menuServiceTimes = computed(() =>
  props.menu.behaviour.ordering.service_hours?.operation_hours
)
const { menuServiceChip: derivedMenuServiceTimes } =
  useMenuServiceComputed(menuServiceTimes)
</script>

<style scoped>
.menu-header {
  display: grid;
  gap: 0.75rem;
  justify-items: center;
}

.menu-service-times-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 1.85rem;
  padding: 0.3rem 0.7rem;
  border: 1px solid currentcolor;
  border-radius: var(--menu-radius-control);
  font-size: 0.72rem;
  font-weight: 950;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.menu-service-times-chip--open {
  background: color-mix(in srgb, #16a34a 16%, var(--menu-bg));
  color: #15803d;
}

.menu-service-times-chip--closed {
  background: color-mix(in srgb, #dc2626 14%, var(--menu-bg));
  color: #b91c1c;
}

.menu-service-times-chip--unknown {
  background: color-mix(in srgb, var(--menu-text) 8%, var(--menu-bg));
  color: var(--menu-muted);
}
</style>
