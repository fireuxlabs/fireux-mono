<template>
  <UCard>
    <template #header>
      <div class="menu-editor-actions">
        <div>
          <h2 class="fx-type-card-heading">Source file</h2>
          <p class="fx-type-caption">
            Review the saved source before turning it into a structured menu.
          </p>
        </div>
        <UButton
          v-if="sourceLink"
          :to="sourceLink"
          target="_blank"
          rel="noopener"
          icon="i-lucide-external-link"
          variant="soft"
        >
          Open source
        </UButton>
      </div>
    </template>

    <UAlert
      v-if="source.source_url"
      color="info"
      variant="soft"
      title="Menu URL source"
      description="This source is a live menu or ordering URL. AI processing will read the fetched page content and map visible menu data into a review draft."
    />
    <img
      v-else-if="source.file_kind === 'photo' && source.file_url"
      :src="source.file_url"
      :alt="source.file_name || source.id"
      class="menu-source-photo"
    />
    <iframe
      v-else-if="source.file_url"
      :src="source.file_url"
      :title="source.file_name || source.id"
      class="menu-source-document"
    />
    <UAlert
      v-else
      color="neutral"
      variant="soft"
      title="Source file unavailable"
      description="This upload record does not have a file URL."
    />

    <div
      v-if="files.length > 1"
      class="workspace-surface workspace-surface--compact"
    >
      <UButton
        v-for="file in files"
        :key="file.storage_path || file.file_url"
        :to="file.file_url"
        target="_blank"
        rel="noopener"
        color="neutral"
        variant="soft"
        icon="i-lucide-file-image"
        class="menu-source-file-link"
      >
        {{ file.file_name || 'Menu source file' }}
      </UButton>
    </div>
  </UCard>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import type { MenuSourceUpload } from '../../../../../../menu/models/menu-source-upload.model'
const props = defineProps<{
  source: MenuSourceUpload
  files: Array<{ file_url: string; file_name?: string; storage_path?: string }>
}>()
const sourceLink = computed(() =>
  String(props.source.source_url || props.source.file_url || '').trim()
)
</script>
