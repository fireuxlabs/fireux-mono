<template>
  <section v-if="menu" class="space-y-4" aria-label="Menu document">
    <UCard v-if="menu.doc?.url">
      <template #header
        ><h2 class="font-semibold">Current document</h2></template
      >
      <p class="mb-3 text-sm text-muted">{{ menu.doc.name }}</p>
      <UButton
        :to="menu.doc.url"
        target="_blank"
        label="Review document"
        icon="i-lucide-external-link"
        color="neutral"
        variant="soft"
      />
    </UCard>
    <WorkspaceKitchenMenusCreateUpload
      v-if="canWrite"
      document
      :upload-id="menuId"
      replace-existing
      description="Choose one PDF or image. Guests will see this document when the Menu is published."
      :cta-label="menu.doc?.url ? 'Replace document' : 'Upload document'"
    />
  </section>
</template>
<script setup lang="ts">
import { useKitchenMenuRecordContext } from '../../../../composables/workspace/menus/useKitchenMenuRecordContext'
const { menu, menuId, canWrite } = useKitchenMenuRecordContext()
</script>
