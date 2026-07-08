<template>
  <section class="console-surface space-y-6">
    <UBreadcrumb :items="breadcrumbItems" />
    <ConsoleKitchenOperationsMenusCardsProfile
      :menu="menu"
      :sections-count="sections.length"
    />
    <ConsoleKitchenOperationsMenusEdit />

    <UCard v-if="source && !menu">
      <template #header>
        <div class="space-y-1">
          <h2 class="text-base font-semibold text-highlighted">
            Process {{ sourceLabel }}
          </h2>
          <p class="text-sm text-dimmed">
            Convert this saved source into a review draft.
          </p>
        </div>
      </template>

      <ConsoleKitchenOperationsMenusProcess />
    </UCard>

    <UCard v-else-if="menu || source">
      <template #header>
        <div class="space-y-1">
          <h2 class="text-base font-semibold text-highlighted">
            Source document and AI processing
          </h2>
          <p class="text-sm text-dimmed">
            Upload the source menu, check storage, and convert it into a review draft.
          </p>
        </div>
      </template>

      <UCollapsible :default-open="false">
        <UButton
          block
          color="neutral"
          variant="soft"
          trailing-icon="i-lucide-chevron-down"
        >
          Source tools
        </UButton>

        <template #content>
          <div class="mt-4 space-y-6">
            <section v-if="menu" class="space-y-3">
              <div class="space-y-1">
                <h3 class="text-sm font-semibold text-highlighted">
                  Source document
                </h3>
                <p class="text-sm text-dimmed">
                  Attach the original PDF or photo before comparing AI output to the current menu.
                </p>
              </div>

              <ConsoleKitchenOperationsMenusCreationUpload
                :upload-id="menuId"
                :lock-slug="true"
                :replace-existing="true"
                title="Upload source document"
                description="Upload the original source files so later AI passes can flag differences against this menu."
                cta-label="Upload source"
              />
            </section>

            <ConsoleKitchenOperationsMenusProcess />
          </div>
        </template>
      </UCollapsible>
    </UCard>
    <ConsoleKitchenOperationsMenusSectionsRead />
    <ConsoleKitchenOperationsMenusPublish />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useKitchenConsoleMenu } from '../../../../../composables/fireux/console/kitchen/operations/Menus/useKitchenConsoleMenu'

const {
  menu,
  source,
  menuId,
  sections,
} = useKitchenConsoleMenu()
const breadcrumbItems = computed(() => [
  {
    label: 'Menus',
    icon: 'i-lucide-book-open',
    to: '/console/kitchen/menus',
  },
  {
    label: String(menu.value?.name || source.value?.id || 'Menu details').trim(),
    icon: 'i-lucide-list-tree',
  },
])
const sourceLabel = computed(() =>
  String(source.value?.source_url ? 'menu URL' : 'menu source')
)
</script>
