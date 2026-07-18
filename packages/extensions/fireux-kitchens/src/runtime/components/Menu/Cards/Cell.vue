<template>
  <article class="menu-card-cell" data-menu-card-cell>
    <NuxtLink :to="browseTo" class="menu-card-cell__identity">
      <UAvatar
        class="menu-card-cell__avatar"
        :class="avatarClass"
        :src="kitchenImageUrl || undefined"
        :alt="kitchenName || menuName"
        size="md"
      />

      <span class="menu-card-cell__copy">
        <span class="menu-card-cell__heading">
          <span class="menu-card-cell__title">{{ menuName }}</span>

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
        </span>

        <span v-if="kitchenName" class="menu-card-cell__kitchen">
          {{ kitchenName }}
        </span>
        <span
          v-if="menuDescription && menuDescription !== kitchenName"
          class="menu-card-cell__description"
        >
          {{ menuDescription }}
        </span>
      </span>
    </NuxtLink>

    <MenuDoorways
      display="icons"
      :contexts="menuContexts"
      :menu-id="menu.id"
      :menu-name="menuName"
      :route-scope="routeScope"
    />
  </article>
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
  menuContexts,
  menuDescription,
  menuName,
  menuServiceChip,
} = useMenuCardPresentation(
  computed(() => props.menu),
  computed(() => props.routeScope)
)
</script>

<style scoped>
.menu-card-cell {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: calc(var(--spacing) * 3);
  padding: calc(var(--spacing) * 3);
  border: 1px solid var(--ui-border);
  border-radius: calc(var(--ui-radius) * 4);
  background: var(--ui-bg-elevated);
  transition: border-color 160ms ease, background 160ms ease;
}

.menu-card-cell:hover {
  border-color: color-mix(in srgb, var(--ui-primary) 36%, var(--ui-border));
  background: color-mix(in srgb, var(--ui-primary) 4%, var(--ui-bg-elevated));
}

.menu-card-cell__identity {
  display: flex;
  min-width: 0;
  flex: 1 1 auto;
  align-items: center;
  gap: calc(var(--spacing) * 3);
  color: inherit;
  text-decoration: none;
}

.menu-card-cell__avatar {
  flex: 0 0 auto;
}

.menu-card-cell__copy {
  display: grid;
  min-width: 0;
}

.menu-card-cell__heading {
  display: flex;
  min-width: 0;
  flex-wrap: wrap;
  align-items: center;
  gap: calc(var(--spacing) * 2);
}

.menu-card-cell__title,
.menu-card-cell__kitchen,
.menu-card-cell__description {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.menu-card-cell__title {
  color: var(--ui-text-highlighted);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
}

.menu-card-cell__kitchen,
.menu-card-cell__description {
  color: var(--ui-text-muted);
  font-size: var(--text-xs);
}

@media (max-width: 44rem) {
  .menu-card-cell {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
