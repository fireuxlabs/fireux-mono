<template>
  <section
    v-if="menu && !pending && !error && selectedKitchen"
    class="menu-services"
    id="menu-services"
    aria-labelledby="menu-services-title"
  >
    <header class="menu-services__heading">
      <div>
        <h2 id="menu-services-title">Linked services</h2>
        <p>Kitchen services using this Menu.</p>
      </div>
      <UButton
        to="/workspace/kitchen/orders/ordering"
        label="Manage services"
        trailing-icon="i-lucide-arrow-up-right"
        color="neutral"
        variant="outline"
      />
    </header>
    <p v-if="!entries.length" class="menu-services__empty">
      This Menu is not linked to an ordering service.
    </p>
    <template v-else>
      <p v-if="menu.doc?.url.trim()" class="menu-services__notice">
        Document Menus are browse-only. Ordering needs items and prices.
      </p>
      <p v-else-if="menu.status !== 'published'" class="menu-services__notice">
        Publish this Menu before customers can order from it.
      </p>
      <ul class="menu-services__list">
        <li
          v-for="entry in entries"
          :key="entry.type"
          class="menu-services__row"
        >
          <div class="menu-services__identity">
            <h3>{{ entry.label }}</h3>
            <UBadge
              :color="
                entry.state === 'Enabled'
                  ? 'success'
                  : entry.state === 'Paused'
                    ? 'warning'
                    : 'neutral'
              "
              variant="subtle"
              >{{ entry.state }}</UBadge
            >
            <span v-if="entry.diagnostic" class="menu-services__note"
              >Customer flow not ready</span
            >
          </div>
          <div class="menu-services__actions">
            <UButton
              v-if="entry.customerUrl"
              :to="entry.customerUrl"
              target="_blank"
              label="View ordering"
              icon="i-lucide-external-link"
              color="neutral"
              variant="ghost"
            />
            <UButton
              v-if="entry.kiosk"
              to="/workspace/kitchen/settings/kiosks"
              label="Kiosk devices"
              icon="i-lucide-monitor"
              color="neutral"
              variant="ghost"
            />
            <UButton
              :to="entry.configurePath"
              label="Configure"
              :aria-label="`Configure ${entry.label}`"
              trailing-icon="i-lucide-chevron-right"
              color="neutral"
              variant="soft"
            />
          </div>
        </li>
      </ul>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRequestURL } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useKitchenWorkspaceMenuRecord } from '../../../composables/workspace/menus/useKitchenWorkspaceMenuRecord'
import { readKitchenOrdering } from '../../../utils/kitchen-ordering'
import {
  directoryMenuRouteScope,
  tenantMenuRouteScope,
} from '../../../utils/kitchen-menu-route'
import { menuWebsiteOrigin } from '../../../utils/menu-website-snippet'
import { menuServiceSummaries } from '../../../utils/menu-service-summary'

const { menu, selectedKitchen, pending, error } =
  useKitchenWorkspaceMenuRecord()
const fireux = useFireUXConfig()
const origin = menuWebsiteOrigin(useRequestURL().origin, fireux.siteUrl)
const entries = computed(() =>
  menu.value
    ? menuServiceSummaries({
        menu: menu.value,
        services: readKitchenOrdering(selectedKitchen.value?.ordering).services,
        scope: fireux.isTenant
          ? tenantMenuRouteScope()
          : directoryMenuRouteScope(selectedKitchen.value?.slug),
        origin,
      })
    : []
)
</script>

<style scoped>
.menu-services {
  display: grid;
  gap: calc(var(--spacing) * 5);
  padding-block: calc(var(--spacing) * 4);
}
.menu-services__heading,
.menu-services__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: calc(var(--spacing) * 4);
}
.menu-services__heading h2 {
  margin: 0;
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--ui-text-highlighted);
}
.menu-services__heading p,
.menu-services__empty,
.menu-services__notice {
  margin: calc(var(--spacing) * 2) 0 0;
  color: var(--ui-text-muted);
  font-size: var(--text-sm);
}
.menu-services__list {
  list-style: none;
  margin: 0;
  padding: 0;
  border-block: 1px solid var(--ui-border);
}
.menu-services__row {
  padding-block: calc(var(--spacing) * 4);
}
.menu-services__row + .menu-services__row {
  border-top: 1px solid var(--ui-border);
}
.menu-services__identity,
.menu-services__actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: calc(var(--spacing) * 3);
}
.menu-services__identity h3 {
  margin: 0;
  font-size: var(--text-base);
  font-weight: 500;
  color: var(--ui-text-highlighted);
}
.menu-services__note {
  font-size: var(--text-sm);
  color: var(--ui-text-muted);
}
</style>
