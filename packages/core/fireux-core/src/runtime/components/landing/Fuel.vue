<template>
  <section class="fuel">
    <header>
      <h2>{{ title }}</h2>
      <p>{{ description }}</p>
    </header>

    <div v-if="meters.length" class="fuel__grid">
      <article v-for="meter in meters" :key="meter.label" class="fuel__card">
        <div class="fuel__meter-head">
          <UIcon :name="meter.icon" />
          <span>{{ meter.label }}</span>
        </div>
        <strong>{{ meter.value }}%</strong>
      </article>
    </div>

    <div v-else class="fuel__grid">
      <article v-for="step in steps" :key="step.title" class="fuel__card">
        <h3>{{ step.title }}</h3>
        <p>{{ step.copy }}</p>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  meters?: Array<{
    label: string
    value: number
    icon: string
  }>
}>()

const title = 'Momentum'
const description = 'A compact snapshot of readiness, rollout, and operator focus.'
const meters = computed(() => props.meters || [])

const steps = [
  {
    title: '1 · Orient',
    copy: 'Confirm the app shell, branding, and runtime posture.',
  },
  {
    title: '2 · Operate',
    copy: 'Open the right public and console routes for the current team.',
  },
  {
    title: '3 · Expand',
    copy: 'Layer richer domain sections once the base flow is steady.',
  },
]
</script>

<style scoped>
.fuel {
  padding: clamp(calc(var(--spacing) * 8), 6vw, calc(var(--spacing) * 12)) 0;
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing) * 6);
}

.fuel header {
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing) * 2);
}

.fuel header h2 {
  font-size: clamp(1.75rem, 3.5vw, 2.25rem);
  font-weight: 700;
}

.fuel header p {
  color: var(--ui-text-muted);
}

.fuel__grid {
  display: grid;
  gap: calc(var(--spacing) * 4);
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.fuel__card {
  border-radius: calc(var(--ui-radius) * 3);
  border: 1px dashed var(--ui-border-muted);
  padding: calc(var(--spacing) * 5);
  background: var(--ui-bg-muted);
}

.fuel__meter-head {
  display: flex;
  align-items: center;
  gap: calc(var(--spacing) * 2);
  margin-bottom: calc(var(--spacing) * 3);
}

.fuel__card h3 {
  font-weight: 600;
  margin-bottom: calc(var(--spacing) * 2);
}

.fuel__card p {
  color: var(--ui-text-muted);
}
</style>
