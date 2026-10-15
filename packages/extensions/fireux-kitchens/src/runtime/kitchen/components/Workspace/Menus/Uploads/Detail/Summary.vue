<template>
  <UCard>
    <template #header>
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 class="text-base font-semibold text-highlighted">
            {{ source.id }}
          </h2>
          <p class="text-sm text-dimmed">
            {{ source.source_url || source.file_name || 'Menu source' }}
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          <UBadge :color="kindColor" variant="soft">
            {{ sourceKind }}
          </UBadge>
          <UBadge :color="statusColor" variant="soft">
            {{ source.status }}
          </UBadge>
        </div>
      </div>
    </template>

    <dl class="grid gap-3 text-sm md:grid-cols-2">
      <div>
        <dt class="text-dimmed">Source type</dt>
        <dd class="font-medium text-highlighted">{{ sourceKind }}</dd>
      </div>
      <div>
        <dt class="text-dimmed">Files</dt>
        <dd class="font-medium text-highlighted">
          {{ fileCount }}
        </dd>
      </div>
      <div>
        <dt class="text-dimmed">Storage owner</dt>
        <dd class="font-medium text-highlighted">
          {{ source.storage_app_id || source.app_id || 'Selected app' }}
        </dd>
      </div>
      <div v-if="source.source_provider">
        <dt class="text-dimmed">Provider</dt>
        <dd class="font-medium text-highlighted">
          {{ source.source_provider }}
        </dd>
      </div>
    </dl>
  </UCard>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import type { MenuSourceUpload } from '../../../../../../menu/models/menu-source-upload.model'
const props = defineProps<{ source: MenuSourceUpload; fileCount: number }>()
const sourceKind = computed(() =>
  props.source.source_url ? 'url' : props.source.file_kind || 'document'
)
const statusColor = computed(() =>
  props.source.status === 'published'
    ? 'success'
    : props.source.status === 'archived'
      ? 'neutral'
      : props.source.status === 'extracting'
        ? 'info'
        : 'warning'
)
const kindColor = computed(() =>
  sourceKind.value === 'photo'
    ? 'primary'
    : sourceKind.value === 'pdf'
      ? 'success'
      : sourceKind.value === 'url'
        ? 'info'
        : 'neutral'
)
</script>
