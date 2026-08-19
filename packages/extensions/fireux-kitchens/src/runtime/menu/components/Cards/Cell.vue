<template>
  <article class="card card--cell menu-card-cell" data-menu-card-cell>
    <NuxtLink :to="browseTo" class="menu-card-cell__identity">
      <span class="menu-card-cell__media" :class="avatarClass">
        <img
          v-if="kitchenImageUrl"
          :src="kitchenImageUrl"
          :alt="kitchenName || menuName"
          class="menu-card-cell__image"
          loading="lazy"
        />
        <UIcon
          v-else
          name="i-lucide-book-open"
          class="menu-card-cell__fallback"
          aria-hidden="true"
        />
      </span>

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

    <footer class="menu-card-cell__footer">
      <MenuDoorways
        display="icons"
        :contexts="menuContexts"
        :menu-id="menu.id"
        :menu-name="menuName"
        :route-scope="routeScope"
      />
    </footer>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useMenuCardPresentation } from '../../composables/useMenuCardPresentation'
import type { MenuDirectoryEntry } from '../../models/menu-directory.model.ts'
import type { MenuRouteScope } from '../../../kitchen/utils/kitchen-menu-route'

const props = defineProps<{
  menu: MenuDirectoryEntry
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
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  min-width: 0;
  align-items: center;
  gap: calc(var(--spacing) * 2);
}

.menu-card-cell__identity {
  display: grid;
  grid-template-columns: calc(var(--spacing) * 16) minmax(0, 1fr);
  min-width: 0;
  align-items: center;
  gap: calc(var(--spacing) * 2.5);
  color: inherit;
  text-decoration: none;
}

.menu-card-cell__media {
  display: grid;
  width: calc(var(--spacing) * 16);
  height: calc(var(--spacing) * 16);
  overflow: hidden;
  place-items: center;
  border-radius: calc(var(--ui-radius) * 3);
  background: var(--ui-bg-muted);
}

.menu-card-cell__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 240ms ease;
}

.menu-card-cell:hover .menu-card-cell__image {
  transform: scale(1.025);
}

.menu-card-cell__fallback {
  width: 1.5rem;
  height: 1.5rem;
  color: var(--ui-text-muted);
}

.menu-card-cell__copy {
  display: grid;
  min-width: 0;
  align-content: center;
  gap: calc(var(--spacing) * 0.75);
}

.menu-card-cell__heading {
  display: flex;
  min-width: 0;
  flex-wrap: wrap;
  align-items: center;
  gap: calc(var(--spacing) * 2);
}

.menu-card-cell__title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.menu-card-cell__title {
  color: var(--ui-text-highlighted);
  font-size: var(--text-base);
  font-weight: var(--font-weight-bold);
  line-height: 1.15;
}

.menu-card-cell__kitchen {
  overflow: hidden;
  color: var(--ui-text-muted);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
  letter-spacing: 0.04em;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.menu-card-cell__description {
  display: -webkit-box;
  overflow: hidden;
  color: var(--ui-text-toned);
  font-size: var(--text-xs);
  line-height: 1.3;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.menu-card-cell__footer {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding-top: calc(var(--spacing) * 2);
  padding-left: calc(var(--spacing) * 1);
  border-top: 1px solid var(--ui-border);
}

@media (min-width: 34rem) {
  .menu-card-cell {
    grid-template-columns: minmax(0, 1fr) auto;
  }

  .menu-card-cell__footer {
    justify-content: flex-end;
    padding-top: 0;
    border-top: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .menu-card-cell__image {
    transition: none;
  }
}
</style>
