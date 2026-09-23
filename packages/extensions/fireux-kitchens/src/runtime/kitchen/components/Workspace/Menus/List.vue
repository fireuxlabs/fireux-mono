<template>
  <section aria-label="Menus">
    <div v-if="pending" class="text-sm text-dimmed">Loading menus...</div>

    <template v-else>
      <CollectionToolbar
        v-if="menus.length"
        v-model="query"
        label="menus"
        singular="menu"
        :count="filteredMenus.length"
      />
      <div v-if="filteredMenus.length" class="mt-4 grid gap-2">
        <CollectionRow
          v-for="menu in filteredMenus"
          :key="menu.id"
          :to="menuWorkspaceDestination(menu)"
          :title="menuTitle(menu)"
          :icon="
            menu.schedule === 'daily'
              ? 'i-lucide-calendar-days'
              : 'i-lucide-book-open'
          "
          :description="menu.description"
          :meta="menu.schedule === 'daily' ? 'Daily menu' : 'Regular menu'"
        >
          <UBadge color="neutral" variant="soft">{{
            menuStatus(menu) === 'published'
              ? 'Published'
              : menuStatus(menu) === 'archived'
                ? 'Archived'
                : 'Unpublished'
          }}</UBadge>
        </CollectionRow>
      </div>
      <UAlert
        v-else-if="menus.length"
        class="mt-4"
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
import { computed, ref, watch } from 'vue'
import CollectionToolbar from '../CollectionToolbar.vue'
import CollectionRow from '../CollectionRow.vue'

import { menuWorkspaceDestination } from '../../../utils/menu-workspace-destination'
import { useKitchenMenusContext } from '../../../composables/workspace/menus/useKitchenMenusContext'
import type { KitchenMenu as Menu } from '../../../../menu/utils/kitchen-menu.ts'

const { menus, pending, kitchenId } = useKitchenMenusContext()

const query = ref('')
const filteredMenus = computed(() =>
  menus.value.filter((menu) =>
    `${menu.name || ''} ${menu.description || ''}`
      .toLocaleLowerCase()
      .includes(query.value.trim().toLocaleLowerCase())
  )
)
watch(kitchenId, () => {
  query.value = ''
})

const text = (value: unknown) => String(value ?? '').trim()

const menuTitle = (menu: Menu) =>
  text(menu.name) || text(menu.id) || 'Untitled menu'
const menuStatus = (menu: Menu) => text(menu.status) || 'draft'
</script>
