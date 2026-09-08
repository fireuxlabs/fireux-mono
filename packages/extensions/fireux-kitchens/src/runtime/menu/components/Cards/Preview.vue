<template>
  <article class="preview menu-card-preview" :class="{ 'menu-card-preview--venue': venueContext }" data-menu-card-preview>
    <div class="menu-card-preview__identity">
      <UAvatar
        v-if="!venueContext"
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

        <p v-if="kitchenName && !venueContext" class="menu-card-preview__kitchen-name">
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
import { useMenuCardPresentation } from '../../composables/useMenuCardPresentation'
import type { MenuDirectoryEntry } from '../../models/menu-collection.model.ts'
import type { MenuRouteScope } from '../../../kitchen/utils/kitchen-menu-route'

const props = defineProps<{
  menu: MenuDirectoryEntry
  routeScope: MenuRouteScope
  venueContext?: boolean
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
  grid-template-columns: minmax(0, 1fr);
  align-items: center;
  gap: calc(var(--spacing) * 5);
  padding: clamp(calc(var(--spacing) * 5), 3vw, calc(var(--spacing) * 7));
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
  padding-top: calc(var(--spacing) * 4);
  border-top: 1px solid var(--ui-border);
}

.menu-card-preview--venue {
  align-content: space-between;
  align-items: start;
}

.menu-card-preview--venue h3 {
  font-size: var(--text-2xl);
}

.menu-card-preview--venue .menu-card-preview__description {
  line-height: var(--leading-relaxed);
}

@media (min-width: 52rem) {
  .menu-card-preview {
    grid-template-columns: minmax(0, 1fr) auto;
  }

  .menu-card-preview__doorways {
    padding-top: 0;
    border-top: 0;
  }

  .menu-card-preview--venue {
    grid-template-columns: minmax(0, 1fr);
  }

  .menu-card-preview--venue .menu-card-preview__doorways {
    padding-top: calc(var(--spacing) * 4);
    border-top: 1px solid var(--ui-border);
  }
}
</style>
