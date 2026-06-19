<template>
  <section class="console-surface space-y-6">
    <UBreadcrumb :items="breadcrumbItems" />
    <ConsoleKitchenOperationsMenusDetails />
    <UCard v-if="menu">
      <template #header>
        <div>
          <h2 class="text-base font-semibold text-highlighted">Source document</h2>
          <p class="text-sm text-dimmed">
            Attach the original PDF or photo before comparing AI output to the current menu.
          </p>
        </div>
      </template>

      <ConsoleKitchenOperationsMenusUpload
        :upload-id="menuId"
        :lock-slug="true"
        title="Upload source document"
        description="Upload the original source so later AI passes can flag differences against this menu."
        cta-label="Upload source"
      />
    </UCard>
    <ConsoleKitchenOperationsMenusSectionsRead />
    <ConsoleKitchenOperationsMenusSectionsCreate />
    <ConsoleKitchenOperationsMenusPublish />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useKitchenConsoleMenu } from '../../../../../composables/fireux/console/kitchen/operations/Menus/useKitchenConsoleMenu'

const { menu } = useKitchenConsoleMenu()
const breadcrumbItems = computed(() => [
  {
    label: 'Menus',
    icon: 'i-lucide-book-open',
    to: '/console/kitchen/menus',
  },
  {
    label: String(menu.value?.name || 'Menu details').trim(),
    icon: 'i-lucide-list-tree',
  },
])
</script>
