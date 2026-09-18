<template>
  <UCard>
    <template #header>
      <h2 class="font-semibold">Customer links</h2>
      <p class="mt-1 text-sm text-muted">
        Each link opens one menu and ordering option. Availability is checked
        when the customer orders.
      </p>
    </template>
    <MoleculesStateCard
      v-if="menusOutcome === 'pending' || menusOutcome === 'idle'"
      entity="Customer links"
      loading
    />
    <MoleculesStateCard
      v-else-if="menusOutcome === 'error'"
      entity="Customer links"
      state="error"
    />
    <p v-else-if="!service.enabled" class="text-sm text-muted">
      Enable this service when you are ready to check its customer links.
    </p>
    <div v-else-if="entries.length" class="divide-y divide-default">
      <div
        v-for="entry in entries"
        :key="entry.menu.id"
        class="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0"
      >
        <h3 class="font-medium">{{ entry.menu.name }}</h3>
        <div class="flex flex-wrap gap-2">
          <UButton
            v-for="link in entry.links"
            :key="link.type"
            :to="link.customerUrl"
            :label="link.type === 'browse' ? 'View menu' : link.label"
            target="_blank"
            icon="i-lucide-external-link"
            color="neutral"
            variant="soft"
          />
        </div>
      </div>
    </div>
    <p v-else class="text-sm text-muted">
      Links appear for published menus with an enabled option. Ordering also
      needs serving hours and cannot be paused.
    </p>
    <template #footer>
      <div class="flex flex-wrap gap-3">
        <UButton
          to="/workspace/kitchen/settings/integrations"
          label="Add a website button"
          color="neutral"
          variant="soft"
          trailing-icon="i-lucide-arrow-right"
        />
        <UButton
          to="/workspace/kitchen/fulfilment"
          label="Delivery & payment settings"
          color="neutral"
          variant="ghost"
        />
      </div>
    </template>
  </UCard>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useRequestURL } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import type { ReadOutcome } from 'fireux-core/runtime/composables/fireux/firestore/operations/read-outcome'
import type { KitchenMenu } from '../../../../menu/models/kitchen-menu.model'
import type { KitchenService } from '../../../models/service.model'
import {
  directoryMenuRouteScope,
  tenantMenuRouteScope,
} from '../../../utils/kitchen-menu-route'
import { menuWebsiteOrigin } from '../../../utils/menu-website-snippet'
import { menuServiceSummaries } from '../../../utils/menu-service-summary'

const props = defineProps<{
  service: KitchenService
  menus: KitchenMenu[]
  menusOutcome: ReadOutcome
  kitchenSlug: string
}>()
const fireux = useFireUXConfig()
const origin = menuWebsiteOrigin(useRequestURL().origin, fireux.siteUrl)
const entries = computed(() => {
  if (!['ready', 'empty'].includes(props.menusOutcome)) return []
  const scope = fireux.isTenant
    ? tenantMenuRouteScope()
    : directoryMenuRouteScope(props.kitchenSlug)
  return props.menus
    .filter((menu) => props.service.menu_ids.includes(menu.id))
    .map((menu) => ({
      menu,
      links:
        menuServiceSummaries({
          menu,
          services: [props.service],
          scope,
          origin,
        })[0]?.interactions.filter((link) => link.customerUrl) || [],
    }))
    .filter((entry) => entry.links.length)
})
</script>
