<template>
  <div class="menu-order-summary">
    <div>
      <p class="menu-order-summary__eyebrow">
        {{ stepLabel }} · {{ eyebrow }}
      </p>
      <h2>{{ title }}</h2>
    </div>

    <div class="menu-order-summary__selection">
      <p>
        <strong>{{ totalLabel }}</strong>
        <span>{{ itemCountLabel }}</span>
      </p>

      <button
        type="button"
        class="menu-order-summary__edit"
        aria-label="Edit selected items"
        @click="$emit('edit')"
      >
        Edit
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
// Menu ordering spine: docs/concepts/menu-ordering.md
defineProps<{
  eyebrow: string
  stepLabel: string
  title: string
  totalLabel: string
  itemCountLabel: string
}>()

defineEmits<{
  (event: 'edit'): void
}>()
</script>
