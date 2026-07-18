<template>
  <article class="menu-public-card" data-menu-public-card>
    <div class="menu-public-card__content">
      <div class="menu-public-card__icon" aria-hidden="true">
        <UIcon name="i-lucide-book-open-text" />
      </div>

      <div class="menu-public-card__copy">
        <div class="menu-public-card__heading">
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

        <p v-if="menuDescription" class="menu-public-card__description">
          {{ menuDescription }}
        </p>
      </div>
    </div>

    <MenuDoorways
      :contexts="menuContexts"
      :menu-id="menu.id"
      :menu-name="menuName"
      :route-scope="routeScope"
    />
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useMenuServiceComputed } from '../../composables/fireux/firestore/menu/useMenu'
import type { MenuRouteContext } from '../../models/kitchen/menu/menu-context.model'
import type {
  MenuOrderingConfig,
  MenuServiceHoursConfig,
} from '../../models/kitchen/menu/kitchen-menu.model'
import {
  guestDiscoverableMenuContexts,
} from '../../utils/menu-context'
import type { MenuRouteScope } from '../../utils/kitchen-menu-route'

type PublicMenuCardSource = {
  id: string
  name: string
  description?: string
  contexts?: MenuRouteContext[]
  ordering?: MenuOrderingConfig
  service_hours?: MenuServiceHoursConfig
}

const props = defineProps<{
  menu: PublicMenuCardSource
  routeScope: MenuRouteScope
}>()

const text = (value: unknown) => String(value ?? '').trim()
const menuName = computed(() => text(props.menu.name))
const menuDescription = computed(() => text(props.menu.description))
const menuContexts = computed(() =>
  props.menu.contexts ?? guestDiscoverableMenuContexts(props.menu.ordering)
)
const serviceHours = computed(() =>
  props.menu.service_hours?.operation_hours ||
  props.menu.ordering?.service_hours?.operation_hours
)
const { menuServiceChip } = useMenuServiceComputed(serviceHours)
</script>

<style scoped>
.menu-public-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: clamp(1.25rem, 3vw, 2rem);
  align-items: center;
  min-height: 10rem;
  padding: clamp(1.25rem, 3vw, 1.75rem);
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
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease,
    transform 160ms ease;
}

.menu-public-card:hover {
  border-color: color-mix(in srgb, var(--ui-primary) 36%, var(--ui-border));
  box-shadow: 0 1rem 2.5rem rgb(0 0 0 / 9%);
  transform: translateY(-2px);
}

.menu-public-card__content {
  display: flex;
  min-width: 0;
  align-items: flex-start;
  gap: 1rem;
}

.menu-public-card__icon {
  display: grid;
  flex: 0 0 auto;
  width: 2.75rem;
  height: 2.75rem;
  place-items: center;
  border-radius: calc(var(--ui-radius) * 4);
  background: color-mix(in srgb, var(--ui-primary) 14%, transparent);
  color: var(--ui-primary);
}

.menu-public-card__icon :deep(svg) {
  width: 1.25rem;
  height: 1.25rem;
}

.menu-public-card__copy {
  min-width: 0;
}

.menu-public-card__heading {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  align-items: center;
}

.menu-public-card h3 {
  margin: 0;
  color: var(--ui-text-highlighted);
  font-size: clamp(1.1rem, 2vw, 1.35rem);
  font-weight: 700;
  letter-spacing: -0.015em;
}

.menu-public-card__description {
  max-width: 58ch;
  margin: 0.55rem 0 0;
  color: var(--ui-text-muted);
  font-size: 0.9rem;
  line-height: 1.55;
}

@media (max-width: 44rem) {
  .menu-public-card {
    grid-template-columns: 1fr;
  }
}
</style>
