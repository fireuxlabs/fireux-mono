<template>
  <section class="console-surface space-y-6">
    <template v-if="selectedKitchen">
      <UAlert
        v-if="readOnly"
        color="neutral"
        variant="soft"
        title="Read only"
        description="This kitchen can be inspected, but changes are disabled."
      />

      <UCard>
        <template #header>
          <div>
            <h2 class="text-base font-semibold text-highlighted">Menu flow</h2>
            <p class="text-sm text-dimmed">
              Upload a menu source, convert it into dishes, then optionally enable Sproochli.
            </p>
          </div>
        </template>

        <div class="grid gap-3 lg:grid-cols-3">
          <div class="rounded-lg bg-muted/40 p-3">
            <div class="text-xs font-medium uppercase tracking-[0.14em] text-muted">
              Step 1
            </div>
            <div class="mt-1 text-sm font-semibold text-highlighted">
              Upload menu source
            </div>
            <p class="mt-1 text-sm text-dimmed">
              Store the original menu PDF as the menu source document.
            </p>
          </div>

          <div class="rounded-lg bg-muted/40 p-3">
            <div class="text-xs font-medium uppercase tracking-[0.14em] text-muted">
              Step 2
            </div>
            <div class="mt-1 text-sm font-semibold text-highlighted">
              Convert to dishes with AI
            </div>
            <p class="mt-1 text-sm text-dimmed">
              Turn the source menu into Dish records, sections, and menu items for review.
            </p>
          </div>

          <div class="rounded-lg bg-muted/40 p-3">
            <div class="text-xs font-medium uppercase tracking-[0.14em] text-muted">
              Step 3
            </div>
            <div class="mt-1 text-sm font-semibold text-highlighted">
              Optional Sproochli
            </div>
            <p class="mt-1 text-sm text-dimmed">
              Enable language tools after the menu has real reviewed content.
            </p>
          </div>
        </div>
      </UCard>

      <ConsoleKitchenOperationsMenusUpload />
      <ConsoleKitchenOperationsMenusRead />

      <DevJson
        title="Kitchen menu console debug"
        context="Kitchen menu console · /console/kitchen/menus"
        :data="debug"
        :default-open="false"
      />
    </template>

    <UAlert
      v-else
      color="neutral"
      variant="soft"
      title="Select a kitchen"
      description="Choose a kitchen before managing menus."
    />
  </section>
</template>

<script setup lang="ts">
import { useKitchenConsoleMenus } from '../../../../../composables/fireux/console/kitchen/operations/Menus/useKitchenConsoleMenus'

const { selectedKitchen, readOnly, debug } = useKitchenConsoleMenus()
</script>
