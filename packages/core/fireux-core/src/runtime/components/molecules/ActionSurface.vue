<template>
  <ULink
    v-if="props.to"
    v-bind="$attrs"
    raw
    :to="props.to"
    :disabled="props.disabled"
    class="fx-action-surface appearance-none text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    :class="disabledClass"
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
    class="fx-action-surface appearance-none text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    :class="disabledClass"
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
    :class="disabledClass"
    data-action-surface="static"
    :data-disabled="props.disabled || undefined"
    :aria-disabled="props.disabled ? 'true' : undefined"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { RouteLocationRaw } from 'vue-router'

defineOptions({
  inheritAttrs: false,
  name: 'MoleculesActionSurface',
})

const props = withDefaults(
  defineProps<{
    action?: boolean
    disabled?: boolean
    to?: RouteLocationRaw
  }>(),
  {
    action: false,
    disabled: false,
  }
)

const emit = defineEmits<{
  (event: 'activate'): void
}>()

const disabledClass = computed(() =>
  props.disabled ? 'cursor-not-allowed opacity-75' : ''
)
</script>
