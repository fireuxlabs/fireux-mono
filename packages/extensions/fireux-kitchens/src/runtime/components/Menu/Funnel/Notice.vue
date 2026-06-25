<template>
  <aside class="order-notice">
    <p>{{ message }}</p>

    <button
      v-if="actionLabel"
      type="button"
      class="order-notice__action"
      @click="$emit('confirm')"
    >
      {{ actionLabel }}
    </button>
  </aside>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    message: string
    actionLabel?: string
  }>(),
  {
    actionLabel: '',
  }
)

defineEmits<{
  (event: 'confirm'): void
}>()
</script>

<style scoped>
.order-notice {
  display: grid;
  gap: 0.85rem;
  width: min(44rem, 100%);
  margin: 0 auto;
  padding: 0.85rem 1rem;
  border: 1px solid color-mix(in srgb, var(--menu-primary) 32%, transparent);
  border-radius: 1rem;
  background: color-mix(in srgb, var(--menu-primary) 10%, var(--menu-bg));
  color: var(--menu-title);
  font-size: 0.92rem;
  font-weight: 800;
  line-height: 1.45;
}

.order-notice p {
  margin: 0;
}

.order-notice__action {
  justify-self: start;
  min-height: 2.4rem;
  padding: 0.6rem 0.9rem;
  border: 0;
  border-radius: 999px;
  background: var(--menu-primary);
  color: var(--menu-bg);
  cursor: pointer;
  font: inherit;
  font-size: 0.86rem;
  font-weight: 900;
}
</style>
