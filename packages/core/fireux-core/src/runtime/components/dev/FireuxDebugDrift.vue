<template>
  <section v-if="findings.length" class="debug-drift">
    <header class="debug-drift__header">
      <div>
        <strong>Contract drift</strong>
        <p>Runtime data differs from the declared debug contract.</p>
      </div>
      <div class="debug-drift__counts">
        <UBadge v-if="missingCount" color="error" variant="soft">
          {{ missingCount }} missing
        </UBadge>
        <UBadge v-if="extraCount" color="warning" variant="soft">
          {{ extraCount }} unexpected
        </UBadge>
      </div>
    </header>
    <div
      v-for="finding in findings"
      :key="finding.target"
      class="debug-drift__finding"
    >
      <strong>{{ finding.target }}</strong>
      <div v-if="finding.missing.length">
        <span>Missing or invalid</span>
        <ul>
          <li v-for="path in finding.missing" :key="path">{{ path }}</li>
        </ul>
      </div>
      <div v-if="finding.extra.length">
        <span>Unexpected</span>
        <ul>
          <li v-for="path in finding.extra" :key="path">{{ path }}</li>
        </ul>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { DevDebugContractFinding } from '../../types/dev-debug'

defineOptions({ name: 'FireuxDebugDrift' })
defineProps<{
  findings: DevDebugContractFinding[]
  missingCount: number
  extraCount: number
}>()
</script>

<style scoped>
.debug-drift {
  overflow: hidden;
  border: 1px solid var(--ui-color-warning-400);
  border-radius: calc(var(--ui-radius) * 2);
  background: var(--ui-bg);
}
.debug-drift__header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: calc(var(--spacing) * 2);
  background: color-mix(in srgb, var(--ui-color-warning-500) 10%, transparent);
  padding: calc(var(--spacing) * 2.5);
}
.debug-drift__header p {
  margin: calc(var(--spacing) * 0.5) 0 0;
  color: var(--ui-text-muted);
  font-size: var(--text-xs);
}
.debug-drift__counts {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing);
}
.debug-drift__finding {
  display: grid;
  gap: var(--spacing);
  padding: calc(var(--spacing) * 2.5);
  font-size: var(--text-xs);
}
.debug-drift__finding + .debug-drift__finding {
  border-top: 1px solid var(--ui-border-muted);
}
.debug-drift__finding span {
  color: var(--ui-text-muted);
}
.debug-drift__finding ul {
  margin: var(--spacing) 0 0;
  padding-left: calc(var(--spacing) * 4);
}
</style>
