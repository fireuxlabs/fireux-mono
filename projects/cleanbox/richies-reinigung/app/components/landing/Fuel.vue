<template>
  <section class="fuel">
    <div class="fuel__content">
      <h2>Powered by CleanBox automations</h2>
      <p>
        Auto-send reminders, balance team load, and surface cross-sell opportunities without adding admin hours.
      </p>
      <div class="fuel__actions">
        <UButton color="primary" size="lg" icon="i-lucide-rocket" @click="$emit('startTour')">
          Start interactive tour
        </UButton>
        <UButton color="neutral" variant="ghost" size="lg" icon="i-lucide-download" @click="$emit('downloadPlaybook')">
          Download playbook
        </UButton>
      </div>
    </div>

    <div class="fuel__meters">
      <div class="fuel__meter" v-for="meter in meters" :key="meter.label">
        <div class="fuel__meter-label">
          <UIcon :name="meter.icon" />
          <span>{{ meter.label }}</span>
        </div>
        <div class="fuel__progress">
          <div class="fuel__progress-bar" :style="{ width: meter.value + '%' }" />
        </div>
        <div class="fuel__value">{{ meter.value }}%</div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
export interface FuelMeter {
  label: string
  value: number
  icon: string
}

defineProps<{ meters: FuelMeter[] }>()

defineEmits<{
  (e: 'startTour'): void
  (e: 'downloadPlaybook'): void
}>()

defineOptions({ name: 'RichiesLandingFuel' })
</script>

<style scoped>
.fuel {
  border-radius: 1.75rem;
  border: 1px solid var(--ui-border-subtle);
  background: linear-gradient(135deg, rgba(13, 79, 73, 0.92), rgba(14, 116, 144, 0.8));
  color: #f8fafc;
  padding: clamp(2rem, 5vw, 3rem);
  display: grid;
  gap: clamp(2rem, 5vw, 3rem);
  grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr));
}

.fuel__content {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.fuel__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.fuel__meters {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.fuel__meter {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem 1.25rem;
  border-radius: 1rem;
  background: rgba(15, 118, 110, 0.45);
  border: 1px solid rgba(148, 163, 184, 0.25);
}

.fuel__meter-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
}

.fuel__progress {
  position: relative;
  width: 100%;
  height: 0.6rem;
  border-radius: 999px;
  background: rgba(226, 232, 240, 0.3);
  overflow: hidden;
}

.fuel__progress-bar {
  position: absolute;
  inset: 0;
  border-radius: 999px;
  background: linear-gradient(90deg, #5eead4, #0f766e);
}

.fuel__value {
  font-size: 0.85rem;
  color: #e0f2f1;
}
</style>
