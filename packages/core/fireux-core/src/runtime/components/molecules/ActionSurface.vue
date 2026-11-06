<template>
  <ULink
    v-if="props.to"
    v-bind="$attrs"
    raw
    :to="props.to"
    :disabled="props.disabled"
    class="fx-action-surface"
    data-action-surface="link"
    :data-disabled="props.disabled || undefined"
  >
    <slot />
  </ULink>

  <button
    v-else-if="props.action"
    v-bind="$attrs"
    type="button"
    :disabled="props.disabled"
    class="fx-action-surface"
    data-action-surface="button"
    :data-disabled="props.disabled || undefined"
    @click="emit('activate')"
  >
    <slot />
  </button>

  <div
    v-else
    v-bind="$attrs"
    class="fx-action-surface"
    data-action-surface="static"
    :data-disabled="props.disabled || undefined"
    :aria-disabled="props.disabled ? 'true' : undefined"
  >
    <slot />
  </div>
</template>

<script setup lang="ts" generic="T extends RouteLocationRaw">
import type { RouteLocationRaw } from 'vue-router'

defineOptions({
  inheritAttrs: false,
  name: 'FireActionSurface',
})

const props = withDefaults(
  defineProps<{
    action?: boolean
    disabled?: boolean
    to?: T
  }>(),
  {
    action: false,
    disabled: false,
  }
)

const emit = defineEmits<{
  (event: 'activate'): void
}>()
</script>
