<template>
  <UCollapsible
    v-bind="collapsibleProps"
    @update:open="$emit('update:open', $event)"
  >
    <UButton
      class="group"
      :label="hasRichLabel ? undefined : title"
      :color="color"
      :variant="variant"
      :size="size"
      :block="block"
      :disabled="disabled"
      trailing-icon="i-lucide-chevron-down"
      :ui="{
        trailingIcon:
          'group-data-[state=open]:rotate-180 transition-transform duration-200',
      }"
    >
      <template v-if="hasRichLabel" #default>
        <span
          v-if="icon"
          class="flex min-w-0 items-start gap-3 text-left"
        >
          <UIcon
            :name="icon"
            class="mt-0.5 size-4 shrink-0 text-muted"
            aria-hidden="true"
          />
          <span class="grid min-w-0">
            <span class="truncate">{{ title }}</span>
            <span
              v-if="description"
              class="truncate text-xs font-normal text-dimmed"
            >
              {{ description }}
            </span>
          </span>
        </span>

        <span v-else class="grid min-w-0 text-left">
          <span class="truncate">{{ title }}</span>
          <span class="truncate text-xs font-normal text-dimmed">
            {{ description }}
          </span>
        </span>
      </template>
    </UButton>

    <template #content>
      <slot />
    </template>
  </UCollapsible>
</template>

<script setup lang="ts">
import type { ButtonProps } from '@nuxt/ui'
import { computed } from 'vue'

const props = withDefaults(defineProps<{
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
}>(), {
  description: '',
  icon: '',
  defaultOpen: false,
  open: null,
  disabled: false,
  unmountOnHide: true,
  color: 'neutral',
  variant: 'soft',
  block: true,
})

defineEmits<{
  (event: 'update:open', value: boolean): void
}>()

const hasRichLabel = computed(() => Boolean(props.icon || props.description))
const collapsibleProps = computed(() => ({
  defaultOpen: props.defaultOpen,
  disabled: props.disabled,
  unmountOnHide: props.unmountOnHide,
  ...(typeof props.open === 'boolean' ? { open: props.open } : {}),
}))
</script>
