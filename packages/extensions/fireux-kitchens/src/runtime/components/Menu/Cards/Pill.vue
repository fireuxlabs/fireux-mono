<template>
  <NuxtLink
    :to="browseTo"
    class="menu-card-pill"
    data-menu-card-pill
  >
    <UAvatar
      class="menu-card-pill__avatar"
      :class="avatarClass"
      :src="kitchenImageUrl || undefined"
      :alt="kitchenName || menuName"
      size="sm"
    />

    <span class="menu-card-pill__copy">
      <span class="menu-card-pill__title">{{ menuName }}</span>
      <span v-if="kitchenName" class="menu-card-pill__kitchen">
        {{ kitchenName }}
      </span>
    </span>

    <ClientOnly>
      <UBadge
        v-if="menuServiceChip.known"
        :color="menuServiceChip.color"
        variant="soft"
        size="xs"
      >
        {{ menuServiceChip.label }}
      </UBadge>
    </ClientOnly>
  </NuxtLink>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useMenuCardPresentation } from '../../../composables/fireux/menu/useMenuCardPresentation'
import type { PublicMenuIndexItem } from '../../../models/kitchen/menu/menu-index.model'
import type { MenuRouteScope } from '../../../utils/kitchen-menu-route'

const props = defineProps<{
  menu: PublicMenuIndexItem
  routeScope: MenuRouteScope
}>()

const {
  avatarClass,
  browseTo,
  kitchenImageUrl,
  kitchenName,
  menuName,
  menuServiceChip,
} = useMenuCardPresentation(
  computed(() => props.menu),
  computed(() => props.routeScope)
)
</script>

<style scoped>
.menu-card-pill {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: calc(var(--spacing) * 2.5);
  padding: calc(var(--spacing) * 2.5) calc(var(--spacing) * 3);
  border: 1px solid var(--ui-border);
  border-radius: calc(var(--ui-radius) * 4);
  background: var(--ui-bg-elevated);
  color: inherit;
  text-decoration: none;
  transition: border-color 160ms ease, background 160ms ease;
}

.menu-card-pill:hover {
  border-color: color-mix(in srgb, var(--ui-primary) 36%, var(--ui-border));
  background: color-mix(in srgb, var(--ui-primary) 4%, var(--ui-bg-elevated));
}

.menu-card-pill__avatar {
  flex: 0 0 auto;
}

.menu-card-pill__copy {
  display: grid;
  min-width: 0;
  flex: 1 1 auto;
}

.menu-card-pill__title,
.menu-card-pill__kitchen {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.menu-card-pill__title {
  color: var(--ui-text-highlighted);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
}

.menu-card-pill__kitchen {
  color: var(--ui-text-muted);
  font-size: var(--text-xs);
}
</style>
