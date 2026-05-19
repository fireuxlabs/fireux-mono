<template>
  <UCard class="section">
    <template #header>
      <div class="section__header">
        <div class="section__copy">
          <h3 class="text-base font-semibold">App info</h3>
          <p class="text-xs text-dimmed">
            Basic app details used around this dashboard.
          </p>
        </div>
      </div>
    </template>

    <dl class="grid gap-3 sm:grid-cols-2">
      <div
        v-for="row in infoRows"
        :key="row.label"
        class="rounded-lg border border-default/60 bg-muted/30 px-3 py-2"
      >
        <dt class="text-xs font-medium text-dimmed">{{ row.label }}</dt>
        <dd class="mt-1 break-words text-sm text-default">{{ row.value }}</dd>
      </div>
    </dl>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AppModel } from '../../../../../models/core/app.model'

const props = defineProps<{
  app: AppModel
}>()

const fallback = 'Not set'
const display = (value: unknown) => {
  const text = String(value ?? '').trim()
  return text || fallback
}

const infoRows = computed(() => [
  { label: 'App ID', value: display(props.app.id) },
  { label: 'Name', value: display(props.app.app_name) },
  { label: 'Short name', value: display(props.app.app_short_name) },
  { label: 'Role', value: display(props.app.role) },
  { label: 'Ecosystem', value: display(props.app.ecosystem) },
  { label: 'Project', value: display(props.app.project_id) },
])
</script>
