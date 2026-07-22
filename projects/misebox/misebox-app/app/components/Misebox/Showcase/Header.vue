<!-- Concurrent edit — 2026-07-22 12:51 CEST — Product Demo pass: provide shared public-showcase orientation without domain lifecycle authority. -->
<template>
  <header class="showcase-header">
    <div class="showcase-header__toolbar">
      <UButton
        to="/demo"
        color="neutral"
        variant="ghost"
        icon="i-lucide-arrow-left"
      >
        All demos
      </UButton>

      <UBadge color="primary" variant="soft">
        Interactive showroom
      </UBadge>
    </div>

    <div class="showcase-header__copy">
      <p>{{ eyebrow }}</p>
      <h1>{{ title }}</h1>
      <p>{{ description }}</p>
    </div>

    <div v-if="$slots.actions" class="showcase-header__actions">
      <slot name="actions" />
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  description: string
  eyebrow: string
  title: string
}>()
</script>

<style scoped>
.showcase-header {
  display: grid;
  gap: clamp(calc(var(--spacing) * 6), 3vw, calc(var(--spacing) * 10));
  width: min(100%, 72rem);
  margin: 0 auto;
  padding: clamp(calc(var(--spacing) * 5), 4vw, calc(var(--spacing) * 12));
}

.showcase-header__toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: calc(var(--spacing) * 4);
}

.showcase-header__copy {
  display: grid;
  max-width: 52rem;
  gap: calc(var(--spacing) * 3);
}

.showcase-header__copy p,
.showcase-header__copy h1 {
  margin: 0;
}

.showcase-header__copy > p:first-child {
  color: var(--ui-primary);
  font-size: 0.76rem;
  font-weight: var(--font-weight-black);
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.showcase-header__copy h1 {
  color: var(--ui-text-highlighted);
  font-size: clamp(2.35rem, 7vw, 5rem);
  font-weight: 950;
  line-height: 0.95;
  letter-spacing: -0.055em;
}

.showcase-header__copy > p:last-child {
  max-width: 46rem;
  color: var(--ui-text-muted);
  font-size: clamp(var(--text-base), 2vw, 1.2rem);
  line-height: 1.7;
}

.showcase-header__actions {
  display: flex;
  flex-wrap: wrap;
  gap: calc(var(--spacing) * 3);
}
</style>
