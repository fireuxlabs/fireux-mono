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
    <p v-else-if="!offering.enabled" class="text-sm text-muted">
      Enable this service when you are ready to check its customer links.
    </p>
    <UButton
      v-else-if="separateCustomerUrl"
      :to="separateCustomerUrl"
      :label="'View ' + offering.name"
      target="_blank"
      color="neutral"
      variant="soft"
    />
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
          :to="
            openWorkspace
              ? undefined
              : '/workspace/kitchen/settings/integrations'
          "
          @click="openWorkspace?.('/workspace/kitchen/settings/integrations')"
          label="Add a website button"
          color="neutral"
          variant="soft"
          trailing-icon="i-lucide-arrow-right"
        />
        <UButton
          :to="
            openWorkspace ? undefined : '/workspace/kitchen/identity/payments'
          "
          @click="openWorkspace?.('/workspace/kitchen/identity/payments')"
          label="Payment settings"
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
import type { Menu } from '../../../../menu/models/menu.model'
import type { KitchenOffering } from '../../../models/offering.model'
import {
  directoryMenuRouteScope,
  tenantMenuRouteScope,
} from '../../../../menu/utils/menu-route'
import { menuWebsiteOrigin } from '../../../utils/menu-website-snippet'
import { menuOfferingSummaries } from '../../../utils/menu-offering-summary'

const props = defineProps<{
  offering: KitchenOffering
  menus: Menu[]
  menusOutcome: ReadOutcome
  kitchenSlug: string
  openWorkspace?: (path: string) => unknown
}>()
const fireux = useFireUXConfig()
const origin = menuWebsiteOrigin(useRequestURL().origin, fireux.siteUrl)
const entries = computed(() => {
  if (!['ready', 'empty'].includes(props.menusOutcome)) return []
  const scope = fireux.isTenant
    ? tenantMenuRouteScope()
    : directoryMenuRouteScope(props.kitchenSlug)
  return props.menus
    .filter((menu) => props.offering.menu_ids.includes(menu.id))
    .map((menu) => ({
      menu,
      links:
        menuOfferingSummaries({
          menu,
          offerings: [props.offering],
          scope,
          origin,
        })[0]?.interactions.filter((link) => link.customerUrl) || [],
    }))
    .filter((entry) => entry.links.length)
})
const separateCustomerUrl = computed(() =>
  props.offering.separate && entries.value.length
    ? `${origin}/kitchens/${encodeURIComponent(props.kitchenSlug)}/menu.collection?offering=${encodeURIComponent(props.offering.id)}`
    : undefined
)
</script>
