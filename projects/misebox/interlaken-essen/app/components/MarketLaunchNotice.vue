<template>
  <aside class="market-launch" aria-labelledby="market-launch-title">
    <span class="market-launch__date">
      <UIcon name="i-lucide-calendar-days" aria-hidden="true" />
      {{ copy('launch_date') }}
    </span>

    <span class="market-launch__copy">
      <strong id="market-launch-title">{{ copy('launch_title') }}</strong>
      <span>{{ copy('launch_body') }}</span>
    </span>

    <NuxtLink
      to="/auth"
      class="market-launch__action"
    >
      {{ copy('register_business') }}
      <UIcon name="i-lucide-arrow-right" aria-hidden="true" />
    </NuxtLink>
  </aside>
</template>

<script setup lang="ts">
import { useInterlakenCopy } from '@/composables/useInterlakenCopy'

const { copy } = useInterlakenCopy()
</script>

<style scoped>
.market-launch {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 1rem;
  align-items: center;
  width: min(100%, 48rem);
  border: 1px solid rgba(251, 243, 223, 0.5);
  border-radius: calc(var(--ui-radius) * 5);
  padding: 0.85rem;
  background: rgba(23, 53, 43, 0.8);
  box-shadow: 0 1rem 2.5rem rgba(12, 35, 31, 0.3);
  color: var(--market-cream);
  backdrop-filter: blur(12px);
}

.market-launch__date {
  display: inline-flex;
  gap: 0.45rem;
  align-items: center;
  border-radius: calc(var(--ui-radius) * 3);
  padding: 0.65rem 0.75rem;
  background: #f4c45f;
  color: var(--market-ink);
  font-size: 0.78rem;
  font-weight: 900;
  white-space: nowrap;
}

.market-launch__copy {
  display: grid;
  gap: 0.2rem;
  min-width: 0;
}

.market-launch__copy strong,
.market-launch__copy span {
  display: block;
}

.market-launch__copy strong {
  font-size: 0.95rem;
  font-weight: 900;
}

.market-launch__copy span {
  color: rgba(251, 243, 223, 0.76);
  font-size: 0.8rem;
  line-height: 1.4;
}

.market-launch__action {
  display: inline-flex;
  gap: 0.45rem;
  align-items: center;
  border: 1px solid rgba(251, 243, 223, 0.5);
  border-radius: calc(var(--ui-radius) * 3);
  padding: 0.65rem 0.8rem;
  color: var(--market-cream);
  font-size: 0.78rem;
  font-weight: 850;
  text-decoration: none;
  white-space: nowrap;
}

.market-launch__action:hover {
  background: var(--market-cream);
  color: var(--market-ink);
}

@media (max-width: 46rem) {
  .market-launch {
    grid-template-columns: 1fr;
    gap: 0.7rem;
  }

  .market-launch__date,
  .market-launch__action {
    justify-content: center;
  }

  .market-launch__copy {
    text-align: center;
  }
}
</style>
