<template>
  <UPageCard
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
            menu.status === 'published'
              ? 'Published'
              : menu.status === 'archived'
                ? 'Archived'
                : 'Draft'
          }}</UBadge
        >
      </div>
    </template>
    <template #title>
      <h3 class="menu-overview-name">{{ menu.name || 'Untitled Menu' }}</h3>
    </template>
    <template #footer>
      <div class="menu-overview-card-footer">
        <span>{{
          menu.schedule === 'daily'
            ? menu.purpose === 'specials'
              ? 'Daily specials'
              : 'Daily menu'
            : 'Open menu'
        }}</span>
        <UIcon name="i-lucide-arrow-up-right" aria-hidden="true" />
      </div>
    </template>
  </UPageCard>
</template>
<script setup lang="ts">
import type { Menu } from '../../../../../menu/models/menu.model'
import { menuWorkspaceDestination } from '../../../../utils/menu-workspace-destination'
defineProps<{ menu: Menu }>()
</script>
<style scoped>
.menu-overview-card-heading,
.menu-overview-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: calc(var(--spacing) * 3);
}
.menu-overview-icon {
  font-size: 1.5rem;
  color: var(--ui-text-muted);
}
.menu-overview-name {
  margin: 0;
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
