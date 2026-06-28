<template>
  <footer class="menu-basket" aria-live="polite">
    <button
      type="button"
      class="menu-basket__button"
      :disabled="pending"
      :aria-label="basketLabel"
      @click="$emit('place')"
    >
      <UIcon
        name="i-lucide-shopping-basket"
        class="menu-basket__icon"
        aria-hidden="true"
      />
    </button>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    quantity: number
    pending?: boolean
    actionLabel?: string
  }>(),
  {
    actionLabel: 'Place order',
    pending: false,
  }
)

defineEmits<{
  (event: 'place'): void
}>()

const basketLabel = computed(() => {
  const count = Math.max(0, Number(props.quantity || 0))
  const countLabel = count
    ? `${count} item${count === 1 ? '' : 's'} selected`
    : 'No items selected'

  return `${props.actionLabel}. ${countLabel}.`
})
</script>
