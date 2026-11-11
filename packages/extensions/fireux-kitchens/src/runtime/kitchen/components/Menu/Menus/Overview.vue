<template>
  <section
    class="workspace-surface workspace-surface--compact"
    aria-label="Your menus"
  >
    <p
      v-if="menusOutcome === 'pending' || menusOutcome === 'idle'"
      role="status"
    >
      Loading menus…
    </p>
    <UAlert
      v-else-if="menusOutcome === 'error'"
      color="error"
      title="Menus could not be loaded"
    />
    <template v-else>
      <div class="menu-overview-heading">
        <h2 class="fx-type-label">Your menus</h2>
        <div class="menu-overview-actions">
          <UButton
            to="/workspace/kitchen/menu/menus"
            label="View menus"
            icon="i-lucide-layout-list"
            variant="outline"
            color="neutral"
            size="sm"
          />
          <UButton
            :to="{
              path: '/workspace/kitchen/menu/menus',
              query: { create: '1' },
            }"
            label="Create menu"
            icon="i-lucide-plus"
            size="sm"
          />
        </div>
      </div>
      <div v-if="visibleMenus.length" class="menu-overview-cards">
        <UPageCard
          v-for="menu in visibleMenus"
          :key="menu.id"
          class="menu-overview-card"
          :title="menu.name || 'Untitled Menu'"
          :description="menu.description || undefined"
          :to="menuWorkspaceDestination(menu)"
          :highlight="menu.status === 'published'"
          highlight-color="success"
          variant="outline"
        >
          <template #header>
            <div class="menu-overview-card-heading">
              <UIcon name="i-lucide-book-open" class="menu-overview-icon" />
              <UBadge
                :color="menu.status === 'published' ? 'success' : 'neutral'"
                variant="subtle"
                :icon="
                  menu.status === 'published'
                    ? 'i-lucide-circle-check'
                    : 'i-lucide-pencil'
                "
                >{{
                  menu.status === 'published' ? 'Published' : 'Draft'
                }}</UBadge
              >
            </div>
          </template>
          <template #title>
            <h3 class="menu-overview-name">
              {{ menu.name || 'Untitled Menu' }}
            </h3>
          </template>
          <template #footer>
            <div class="menu-overview-card-footer">
              <span>{{
                menu.schedule === 'daily' ? 'Daily specials' : 'Open menu'
              }}</span>
              <UIcon name="i-lucide-arrow-up-right" aria-hidden="true" />
            </div>
          </template>
        </UPageCard>
      </div>
      <p v-else>No menus yet. Add your first menu to get started.</p>
    </template>
  </section>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useMenuGroupIndexContext } from '../../../composables/workspace/menu-group/useMenuGroupIndexContext'
import { menuWorkspaceDestination } from '../../../utils/menu-workspace-destination'
const { menus, menusOutcome } = useMenuGroupIndexContext()
const visibleMenus = computed(() =>
  menus.value
    .filter((menu) => menu.status !== 'archived')
    .slice()
    .sort(
      (a, b) =>
        Number(b.status === 'published') - Number(a.status === 'published') ||
        Number(a.sort_order || 0) - Number(b.sort_order || 0) ||
        a.name.localeCompare(b.name)
    )
)
</script>
<style scoped>
.menu-overview-actions,
.menu-overview-heading,
.menu-overview-card-heading,
.menu-overview-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: calc(var(--spacing) * 3);
}
.menu-overview-heading {
  flex-wrap: wrap;
}
.menu-overview-actions {
  flex-wrap: wrap;
}
.menu-overview-heading h2,
.menu-overview-name {
  margin: 0;
}
.menu-overview-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr));
  gap: calc(var(--spacing) * 3);
}
.menu-overview-icon {
  font-size: 1.5rem;
  color: var(--ui-text-muted);
}
.menu-overview-name {
  font-size: 1.375rem;
  line-height: 1.3;
  font-weight: 650;
  text-wrap: balance;
}
.menu-overview-card-footer {
  color: var(--ui-text-muted);
  font-size: 0.8125rem;
}
</style>
