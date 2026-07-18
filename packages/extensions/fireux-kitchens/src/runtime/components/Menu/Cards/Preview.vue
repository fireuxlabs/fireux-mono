<template>
  <article class="menu-card-preview" data-menu-card-preview>
    <div class="menu-card-preview__identity">
      <UAvatar
        class="menu-card-preview__avatar"
        :class="avatarClass"
        :src="kitchenImageUrl || undefined"
        :alt="kitchenName || menuName"
        size="lg"
      />

      <div class="menu-card-preview__copy">
        <div class="menu-card-preview__heading">
          <h3>{{ menuName }}</h3>

          <ClientOnly>
            <UBadge
              v-if="menuServiceChip.known"
              :color="menuServiceChip.color"
              variant="soft"
            >
              {{ menuServiceChip.label }}
            </UBadge>
          </ClientOnly>
        </div>

        <p v-if="kitchenName" class="menu-card-preview__kitchen-name">
          {{ kitchenName }}
        </p>

        <p
          v-if="menuDescription && menuDescription !== kitchenName"
          class="menu-card-preview__description"
        >
          {{ menuDescription }}
        </p>
      </div>
    </div>

    <div class="menu-card-preview__doorways">
      <MenuDoorways
        :contexts="menuContexts"
        :menu-id="menu.id"
        :menu-name="menuName"
        :route-scope="routeScope"
      />
    </div>
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
.menu-card-preview {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: calc(var(--spacing) * 5);
  padding: clamp(calc(var(--spacing) * 5), 3vw, calc(var(--spacing) * 7));
  border: 1px solid var(--ui-border);
  border-radius: calc(var(--ui-radius) * 6);
  background:
    radial-gradient(
      circle at 100% 0%,
      color-mix(in srgb, var(--ui-primary) 10%, transparent),
      transparent 42%
    ),
    var(--ui-bg-elevated);
  box-shadow: 0 0.75rem 2rem rgb(0 0 0 / 6%);
  transition: border-color 160ms ease, box-shadow 160ms ease;
}

.menu-card-preview:hover {
  border-color: color-mix(in srgb, var(--ui-primary) 36%, var(--ui-border));
  box-shadow: 0 1rem 2.5rem rgb(0 0 0 / 9%);
}

.menu-card-preview__identity {
  display: flex;
  min-width: 0;
  align-items: flex-start;
  gap: calc(var(--spacing) * 4);
}

.menu-card-preview__avatar {
  flex: 0 0 auto;
}

.menu-card-preview__copy {
  min-width: 0;
}

.menu-card-preview__heading {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: calc(var(--spacing) * 2);
}

.menu-card-preview h3 {
  margin: 0;
  color: var(--ui-text-highlighted);
  font-size: clamp(1.1rem, 2vw, 1.35rem);
  font-weight: var(--font-weight-bold);
  letter-spacing: -0.015em;
}

.menu-card-preview__kitchen-name,
.menu-card-preview__description {
  max-width: 58ch;
  margin: calc(var(--spacing) * 2) 0 0;
  color: var(--ui-text-muted);
  font-size: var(--text-sm);
  line-height: var(--leading-normal);
}

.menu-card-preview__kitchen-name {
  color: var(--ui-text-toned);
  font-weight: var(--font-weight-semibold);
}

.menu-card-preview__kitchen-name + .menu-card-preview__description {
  margin-top: var(--spacing);
}

.menu-card-preview__doorways {
  align-self: center;
}

@media (max-width: 52rem) {
  .menu-card-preview {
    grid-template-columns: minmax(0, 1fr);
  }

  .menu-card-preview__doorways {
    padding-top: calc(var(--spacing) * 4);
    border-top: 1px solid var(--ui-border);
  }
}
</style>
