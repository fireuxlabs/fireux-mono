<template>
  <UBadge
    :variant="variant"
    :color="color"
    :size="size"
    class="fx-metric"
    :title="title || undefined"
    :aria-label="ariaLabel || title || undefined"
  >
    <UIcon v-if="icon" :name="icon" class="fx-metric__icon" />
    <span class="fx-metric__value">{{ value }}</span>
    <span v-if="label" class="fx-metric__label">{{ label }}</span>
  </UBadge>
</template>

<script setup lang="ts">
type Props = {
  icon?: string
  value: string | number
  label?: string

  variant?: 'soft' | 'subtle' | 'solid' | 'outline'
  color?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'

  title?: string
  ariaLabel?: string
}

withDefaults(defineProps<Props>(), {
  icon: '',
  label: '',
  variant: 'soft',
  color: 'neutral',
  size: 'xs',
  title: '',
  ariaLabel: '',
})
</script>
