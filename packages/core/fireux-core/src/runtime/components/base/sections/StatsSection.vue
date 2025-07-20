<template>
  <div v-if="hasStats" class="stats-grid">
    <div v-for="stat in statsItems" :key="stat.key" class="stat-item">
      <UIcon :name="stat.icon" class="stat-icon" />
      <div class="stat-content">
        <span class="stat-label">{{ stat.label }}</span>
        <span class="stat-value">{{ stat.value }}</span>
      </div>
    </div>
  </div>
  <div v-else class="empty-state">
    <p>No information available</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface StatItem {
  key: string
  label: string
  value: string
  icon: string
}

interface Props {
  data: Record<string, any>
  config?: {
    fields?: string[]
    fieldConfigs?: Record<string, { label: string; icon: string }>
  }
}

const props = defineProps<Props>()

const statsItems = computed(() => {
  const items: StatItem[] = []
  const fields = props.config?.fields || Object.keys(props.data || {})

  fields.forEach((field) => {
    const value = props.data?.[field]
    if (value) {
      const fieldConfig = props.config?.fieldConfigs?.[field]
      items.push({
        key: field,
        label: fieldConfig?.label || formatFieldName(field),
        value: String(value),
        icon: fieldConfig?.icon || 'i-heroicons-information-circle',
      })
    }
  })

  return items
})

const hasStats = computed(() => statsItems.value.length > 0)

function formatFieldName(field: string): string {
  return field
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
}
</script>

<style scoped>
.stats-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.stat-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-3);
  background-color: var(--ui-bg-elevated);
  border: 1px solid var(--ui-border);
  border-radius: var(--radius-md);
}

.stat-icon {
  flex-shrink: 0;
  width: 1.25rem;
  height: 1.25rem;
  color: var(--primary-600);
  margin-top: 0.125rem;
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  min-width: 0;
  flex: 1;
}

.stat-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
}

.stat-value {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.empty-state {
  text-align: center;
  padding: var(--space-6);
  color: var(--text-secondary);
  font-style: italic;
}
</style>
