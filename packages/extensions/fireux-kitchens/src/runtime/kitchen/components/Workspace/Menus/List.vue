<template>
  <section aria-label="Menus">
    <div v-if="pending" class="text-sm text-dimmed">Loading menus...</div>

    <div
      v-else-if="menus.length"
      class="divide-y divide-default overflow-hidden rounded-xl border border-default bg-default"
    >
      <button
        v-for="menu in menus"
        :key="menu.id"
        :aria-pressed="selectedMenuId === menu.id"
        :class="
          selectedMenuId === menu.id
            ? 'bg-primary/5 ring-1 ring-inset ring-primary/30'
            : ''
        "
        type="button"
        @click="selectedMenuId = menu.id"
        class="group flex w-full text-left min-w-0 items-center gap-4 px-4 py-4 transition hover:bg-elevated focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:px-5"
      >
        <div class="min-w-0 flex-1">
          <div class="flex min-w-0 flex-wrap items-center gap-2">
            <h2 class="truncate font-semibold text-highlighted">
              {{ menuTitle(menu) }}
            </h2>
            <UBadge :color="statusColor(menu)" variant="soft" size="xs">
              {{ menuStatus(menu) }}
            </UBadge>
          </div>

          <p
            v-if="menuDescription(menu)"
            class="mt-1 line-clamp-2 text-sm text-muted"
          >
            {{ menuDescription(menu) }}
          </p>

          <p v-if="updatedLabel(menu)" class="mt-2 text-xs text-dimmed">
            Updated {{ updatedLabel(menu) }}
          </p>
        </div>

        <UIcon
          name="i-lucide-chevron-right"
          class="size-5 shrink-0 text-muted transition-transform group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </button>
    </div>

    <UAlert
      v-else
      color="neutral"
      variant="soft"
      title="No menus yet"
      description="Create a menu or import one from a URL, photo, or PDF."
    />
  </section>
</template>

<script setup lang="ts">
import { formatFirestoreTimestamp } from 'fireux-core/runtime/utils/formatTimestamp'
import { useKitchenMenusContext } from '../../../composables/workspace/menus/useKitchenMenusContext'
import type { KitchenMenu as Menu } from '../../../../menu/utils/kitchen-menu.ts'

const { menus, pending, selectedMenuId } = useKitchenMenusContext()

const text = (value: unknown) => String(value ?? '').trim()

const menuTitle = (menu: Menu) =>
  text(menu.name) || text(menu.id) || 'Untitled menu'
const menuDescription = (menu: Menu) => text(menu.description)
const menuStatus = (menu: Menu) => text(menu.status) || 'draft'
const statusColor = (menu: Menu) =>
  menuStatus(menu) === 'published'
    ? 'success'
    : menuStatus(menu) === 'archived'
      ? 'neutral'
      : 'warning'
const updatedLabel = (menu: Menu) =>
  formatFirestoreTimestamp(menu.updated?.at, {
    format: { dateStyle: 'medium' },
  })
</script>
