<template>
  <NuxtLink
    :to="browseTo"
    class="pill menu-card-pill"
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
  min-width: 0;
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
