<template>
  <UCard class="section">
    <template #header>
      <div class="section__header">
        <div class="section__copy">
          <h3>App info</h3>
          <p>
            View the basic details for this app.
          </p>
        </div>
      </div>
    </template>

    <div
      v-for="row in infoRows"
      :key="row.label"
      class="section__item"
    >
      <dl>
        <dt class="mb-1 text-sm font-medium text-default">{{ row.label }}</dt>
        <dd class="min-h-9 rounded-md bg-muted/30 px-3 py-2 text-sm text-default">
          {{ row.value }}
        </dd>
      </dl>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AppModel } from '../../../../models/core/app.model'

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
  { label: 'Status', value: display(props.app.status) },
  { label: 'Project', value: display(props.app.project_id) },
  { label: 'Ecosystem', value: display(props.app.ecosystem) },
])
</script>
