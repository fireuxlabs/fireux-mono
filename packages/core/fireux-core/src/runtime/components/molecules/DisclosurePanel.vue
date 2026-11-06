<template>
  <UCollapsible
    v-bind="collapsibleProps"
    @update:open="$emit('update:open', $event)"
  >
    <template #default="{ open: expanded }">
      <UButton
        class="fire-disclosure-panel__trigger"
        :color="color"
        :variant="variant"
        :size="size"
        :block="block"
        :disabled="disabled"
        :icon="icon || undefined"
        :trailing-icon="
          expanded ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'
        "
      >
        <span class="fire-disclosure-panel__label">
          <span>{{ title }}</span>
          <span v-if="description" class="fire-disclosure-panel__description">{{
            description
          }}</span>
        </span>
      </UButton>
    </template>
    <template #content><slot /></template>
  </UCollapsible>
</template>

<script setup lang="ts">
import type { ButtonProps } from '@nuxt/ui'
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    title: string
    description?: string
    icon?: string
    defaultOpen?: boolean
    open?: boolean | null
    disabled?: boolean
    unmountOnHide?: boolean
    color?: ButtonProps['color']
    variant?: ButtonProps['variant']
    size?: ButtonProps['size']
    block?: boolean
  }>(),
  {
    description: '',
    icon: '',
    defaultOpen: false,
    open: null,
    disabled: false,
    unmountOnHide: true,
    color: 'neutral',
    variant: 'soft',
    block: true,
  }
)
defineEmits<{ 'update:open': [value: boolean] }>()
const collapsibleProps = computed(() => ({
  defaultOpen: props.defaultOpen,
  disabled: props.disabled,
  unmountOnHide: props.unmountOnHide,
  ...(typeof props.open === 'boolean' ? { open: props.open } : {}),
}))
</script>

<style scoped>
.fire-disclosure-panel__trigger {
  text-align: start;
}
.fire-disclosure-panel__label {
  display: grid;
  flex: 1;
  min-width: 0;
  gap: var(--spacing);
}
.fire-disclosure-panel__description {
  font-size: var(--text-xs);
  font-weight: 400;
  color: var(--ui-text-dimmed);
}
</style>
