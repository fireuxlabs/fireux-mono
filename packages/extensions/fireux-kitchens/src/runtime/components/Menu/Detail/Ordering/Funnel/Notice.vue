<template>
  <aside class="order-notice">
    <div class="order-notice__icon" aria-hidden="true">
      <UIcon name="i-lucide-shield-alert" />
    </div>

    <div class="order-notice__copy">
      <p class="order-notice__eyebrow">
        Before we send it
      </p>
      <h3>Food allergy or intolerance?</h3>
      <p>{{ message }}</p>
    </div>

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
  gap: 1rem;
  align-content: center;
  justify-items: start;
  width: min(44rem, 100%);
  min-height: min(22rem, calc(100svh - 12rem));
  margin: 0 auto;
  padding: clamp(1.2rem, 5vw, 2rem);
  border: 1px solid color-mix(in srgb, var(--menu-primary) 32%, transparent);
  border-radius: 1.2rem;
  background: color-mix(in srgb, var(--menu-primary) 10%, var(--menu-bg));
  color: var(--menu-title);
  font-size: 1rem;
  font-weight: 750;
  line-height: 1.45;
}

.order-notice p,
.order-notice h3 {
  margin: 0;
}

.order-notice__icon {
  display: grid;
  place-items: center;
  width: 3rem;
  height: 3rem;
  border-radius: 999px;
  background: var(--menu-primary);
  color: var(--menu-bg);
  font-size: 1.45rem;
}

.order-notice__copy {
  display: grid;
  gap: 0.55rem;
}

.order-notice__eyebrow {
  color: var(--menu-muted);
  font-size: 0.74rem;
  font-weight: 900;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.order-notice h3 {
  color: var(--menu-title);
  font-size: clamp(1.8rem, 7vw, 2.8rem);
  font-weight: 950;
  letter-spacing: -0.06em;
  line-height: 0.95;
}

.order-notice__action {
  justify-self: start;
  min-height: 2.75rem;
  padding: 0.7rem 1rem;
  border: 0;
  border-radius: 999px;
  background: var(--menu-primary);
  color: var(--menu-bg);
  cursor: pointer;
  font: inherit;
  font-size: 0.86rem;
  font-weight: 900;
}

@media (max-width: 640px) {
  .order-notice {
    min-height: min(28rem, calc(100svh - 6rem));
  }

  .order-notice__action {
    justify-self: stretch;
  }
}
</style>
