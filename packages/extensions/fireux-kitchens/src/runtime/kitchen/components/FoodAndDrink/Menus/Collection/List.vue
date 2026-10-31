<template>
  <section aria-label="Menus">
    <div v-if="pending" class="fx-type-caption">Loading menus...</div>

    <template v-else>
      <WorkspaceKitchenCollectionToolbar
        v-if="menus.length"
        v-model="query"
        label="menus"
        singular="menu"
        :count="filteredMenus.length"
      />
      <UButton
        v-if="archivedCount"
        :label="showArchived ? 'Hide archived' : `Archived (${archivedCount})`"
        color="neutral"
        variant="ghost"
        size="sm"
        class="workspace-surface workspace-surface--compact"
        @click="showArchived = !showArchived"
      />
      <div
        v-if="filteredMenus.length"
        class="workspace-surface workspace-surface--compact"
      >
        <section
          v-for="group in groups"
          :key="group.label"
          :aria-label="group.label"
          class="workspace-surface workspace-surface--compact"
        >
          <h2 class="fx-type-card-heading">{{ group.label }}</h2>
          <WorkspaceKitchenCollectionRow
            v-for="menu in group.menus"
            :key="menu.id"
            :to="menuWorkspaceDestination(menu)"
            :title="menuTitle(menu)"
            :icon="group.icon"
            :description="menu.description"
          >
            <UBadge
              v-if="menu.audience === 'private_link'"
              color="neutral"
              variant="outline"
              >Private link</UBadge
            >
            <UBadge color="neutral" variant="soft">{{
              menuStatus(menu) === 'published'
                ? 'Published'
                : menuStatus(menu) === 'archived'
                  ? 'Archived'
                  : 'Unpublished'
            }}</UBadge>
          </WorkspaceKitchenCollectionRow>
        </section>
      </div>
      <UAlert
        v-else-if="menus.length"
        class="workspace-surface workspace-surface--compact"
        color="neutral"
        title="No matching menus"
      />

      <UAlert
        v-else
        color="neutral"
        variant="soft"
        title="No menus yet"
        description="Create a menu or import one from a URL, photo, or PDF."
      />
    </template>
  </section>
</template>

<script setup lang="ts">
import { useMenuList } from '../../../../composables/workspace/menus/useMenuList'
import { menuWorkspaceDestination } from '../../../../utils/menu-workspace-destination'
import { useKitchenMenusContext } from '../../../../composables/workspace/menus/useKitchenMenusContext'
import type { Menu } from '../../../../../menu/models/menu-storage.model.ts'

const { rawMenus: menus, pending } = useKitchenMenusContext()
const { query, showArchived, archivedCount, filteredMenus, groups } =
  useMenuList()

const text = (value: unknown) => String(value ?? '').trim()

const menuTitle = (menu: Menu) =>
  text(menu.internal_name) ||
  text(menu.name) ||
  text(menu.id) ||
  'Untitled menu'
const menuStatus = (menu: Menu) => text(menu.status) || 'draft'
</script>
