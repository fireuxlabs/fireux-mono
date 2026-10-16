<template>
  <section class="space-y-4">
    <div class="grid gap-3 sm:grid-cols-2" aria-label="Menu format">
      <UButton
        v-for="choice in choices"
        :key="choice.value"
        :label="choice.label"
        :icon="choice.icon"
        color="neutral"
        :variant="format === choice.value ? 'soft' : 'outline'"
        :aria-pressed="format === choice.value"
        @click="format = choice.value"
      />
    </div>
    <p class="text-sm text-muted">
      {{
        format === 'interactive'
          ? 'Editable sections, dishes and prices.'
          : 'A PDF or image for guests to view.'
      }}
    </p>
    <WorkspaceKitchenMenusCreateForm :key="format" :format="format" />
    <MoleculesDisclosurePanel
      v-if="format === 'interactive'"
      title="Import an existing Menu"
      :default-open="false"
    >
      <div class="mt-4 space-y-4">
        <WorkspaceKitchenMenusCreateUrl />
        <WorkspaceKitchenMenusCreateQueue />
        <WorkspaceKitchenMenusCreateUpload
          title="Upload import source"
          description="Extract sections and items from a PDF or photos, then review them."
          cta-label="Upload source"
        />
      </div>
    </MoleculesDisclosurePanel>
  </section>
</template>
<script setup lang="ts">
import { ref } from 'vue'
const format = ref<'interactive' | 'document'>('interactive')
const choices = [
  {
    value: 'interactive' as const,
    label: 'Interactive Menu',
    icon: 'i-lucide-list-tree',
  },
  {
    value: 'document' as const,
    label: 'Document Menu',
    icon: 'i-lucide-file-text',
  },
]
</script>
