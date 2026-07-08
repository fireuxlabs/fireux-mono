<template>
  <NuxtLink
    v-if="to"
    v-bind="attrs"
    :to="to"
    class="misebox-menu-close"
    :aria-label="ariaLabel"
  >
    <UIcon
      aria-hidden="true"
      name="i-lucide-x"
    />
  </NuxtLink>

  <button
    v-else
    v-bind="attrs"
    class="misebox-menu-close"
    type="button"
    :aria-label="ariaLabel"
    @click="emit('click', $event)"
  >
    <UIcon
      aria-hidden="true"
      name="i-lucide-x"
    />
  </button>
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'

defineOptions({
  inheritAttrs: false,
})

withDefaults(
  defineProps<{
    ariaLabel?: string
    to?: string
  }>(),
  {
    ariaLabel: 'Close menu',
    to: undefined,
  },
)

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const attrs = useAttrs()
</script>

<style scoped>
.misebox-menu-close {
  display: grid;
  width: var(--misebox-menu-close-size, 4.5rem);
  height: var(--misebox-menu-close-size, 4.5rem);
  padding: 0;
  place-items: center;
  border: 1px solid var(--misebox-menu-close-border, var(--ui-border, currentColor));
  border-radius: 999px;
  background: var(--misebox-menu-close-bg, var(--ui-bg, Canvas));
  color: var(--misebox-menu-close-fg, var(--ui-text, currentColor));
  cursor: pointer;
  overflow: hidden;
  box-shadow: 0 0.85rem 2rem var(--misebox-menu-close-shadow, rgb(0 0 0 / 14%));
  text-decoration: none;
  transition:
    background 180ms ease,
    border-color 180ms ease,
    color 180ms ease,
    box-shadow 180ms ease,
    transform 180ms ease;
}

.misebox-menu-close :deep(.iconify) {
  width: var(--misebox-menu-close-icon-size, 2.5rem);
  height: var(--misebox-menu-close-icon-size, 2.5rem);
}
</style>
