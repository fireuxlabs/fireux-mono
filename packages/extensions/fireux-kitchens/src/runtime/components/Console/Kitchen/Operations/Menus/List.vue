<template>
  <section aria-label="Menus">
    <div v-if="pending" class="text-sm text-dimmed">
      Loading menus...
    </div>

    <div v-else-if="menus.length" class="flex flex-wrap gap-3">
      <NuxtLink
        v-for="menu in menus"
        :key="menu.id"
        :to="menuPath(menu)"
        class="menu-list__card group flex min-w-0 flex-col overflow-hidden rounded-xl border border-default bg-default shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:bg-elevated hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <img
          v-if="menuPreviewDish(menu)"
          :src="menuPreviewDish(menu)?.imageUrl"
          :alt="`${menuPreviewDish(menu)?.name} from ${menuTitle(menu)}`"
          class="menu-list__thumbnail w-full object-cover"
          loading="lazy"
        >
        <div
          v-else
          class="menu-list__thumbnail flex w-full items-center justify-center bg-elevated text-muted"
          aria-hidden="true"
        >
          <UIcon name="i-lucide-image" class="size-7" />
        </div>

        <div class="flex min-w-0 w-full items-center gap-2 border-t border-default px-3 py-3">
          <h3 class="truncate text-sm font-semibold text-highlighted">
            {{ menuTitle(menu) }}
          </h3>
          <UIcon
            name="i-lucide-arrow-right"
            class="ml-auto size-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5"
          />
        </div>
      </NuxtLink>
    </div>

    <UAlert
      v-else
      color="neutral"
      variant="soft"
      title="No menus yet"
      :description="readOnly
        ? 'No menus are available in this read-only source.'
        : 'Create a menu from a URL, photo, or PDF source.'"
    />
  </section>
</template>

<script setup lang="ts">
import { useKitchenMenusWorkspace } from '../../../../../composables/fireux/console/kitchen/operations/Menus/useKitchenMenusWorkspace'
import type { Menu } from '../../../../../models/kitchen/menu/menu.model'

const {
  menus,
  pending,
  readOnly,
  getMenuPreviewDish,
} = useKitchenMenusWorkspace()

const text = (value: unknown) => String(value ?? '').trim()

const menuTitle = (menu: Menu) => text(menu.name) || text(menu.id) || 'Untitled menu'
const menuPath = (menu: Menu) =>
  `/console/kitchen/menus/${encodeURIComponent(text(menu.id))}`
const menuPreviewDish = (menu: Menu) => getMenuPreviewDish(menu.id)
</script>

<style scoped>
.menu-list__card {
  flex: 0 0 calc(var(--spacing) * 38);
}

.menu-list__thumbnail {
  aspect-ratio: 1;
}
</style>
