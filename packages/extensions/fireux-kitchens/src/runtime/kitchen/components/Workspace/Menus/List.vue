<template>
  <section aria-label="Menus">
    <div v-if="pending" class="text-sm text-dimmed">Loading menus...</div>

    <div v-else-if="menus.length" class="grid min-w-0 grid-cols-1 gap-2">
      <NuxtLink
        v-for="menu in menus"
        :key="menu.id"
        :to="menuWorkspaceDestination(menu)"
        class="flex items-center gap-3 rounded-lg p-3 hover:bg-elevated focus-visible:outline-2 focus-visible:outline-primary"
      >
        <UAvatar
          :icon="statusIcon(menu)"
          :class="{
            'menu-status--published': menuStatus(menu) === 'published',
          }"
          :title="
            menuStatus(menu) === 'draft' ? 'Unpublished' : menuStatus(menu)
          "
          aria-hidden="true"
        />
        <span class="truncate">{{ menuTitle(menu) }}</span>
        <UBadge v-if="menu.schedule === 'daily'" variant="soft" size="sm"
          >Daily</UBadge
        >
        <span class="sr-only">{{
          menuStatus(menu) === 'draft' ? 'Unpublished' : menuStatus(menu)
        }}</span>
      </NuxtLink>
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
import { menuWorkspaceDestination } from '../../../utils/menu-workspace-destination'
import { useKitchenMenusContext } from '../../../composables/workspace/menus/useKitchenMenusContext'
import type { KitchenMenu as Menu } from '../../../../menu/utils/kitchen-menu.ts'

const { menus, pending } = useKitchenMenusContext()

const text = (value: unknown) => String(value ?? '').trim()

const menuTitle = (menu: Menu) =>
  text(menu.name) || text(menu.id) || 'Untitled menu'
const menuStatus = (menu: Menu) => text(menu.status) || 'draft'
const statusIcon = (menu: Menu) =>
  menuStatus(menu) === 'published'
    ? 'i-lucide-check'
    : menuStatus(menu) === 'archived'
      ? 'i-lucide-archive'
      : 'i-lucide-file-pen-line'
</script>

<style scoped>
.menu-status--published {
  color: var(--ui-success);
  background: color-mix(in srgb, var(--ui-success) 15%, var(--ui-bg));
}
</style>
