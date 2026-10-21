<template>
  <section
    v-if="menu && !pending && !error && selectedKitchen"
    id="menu-offerings"
    class="space-y-4 py-4"
    aria-labelledby="menu-offerings-title"
  >
    <header class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 id="menu-offerings-title" class="text-lg font-semibold">
          Linked offerings
        </h2>
        <p class="text-sm text-muted">Kitchen offerings using this Menu.</p>
      </div>
      <UButton
        to="/workspace/kitchen/food-and-drink/services"
        label="Manage services"
        color="neutral"
        variant="outline"
        trailing-icon="i-lucide-arrow-up-right"
      />
    </header>
    <MoleculesStateCard
      v-if="!['ready', 'empty'].includes(offeringsOutcome)"
      :state="
        offeringsOutcome === 'pending'
          ? 'loading'
          : offeringsOutcome === 'error'
            ? 'error'
            : 'empty'
      "
      :title="
        offeringsOutcome === 'pending'
          ? 'Loading offerings'
          : 'Offerings unavailable'
      "
    />
    <p v-else-if="!entries.length" class="text-sm text-muted">
      This Menu is not linked to a offering.
    </p>
    <p v-if="menu.schedule === 'daily'" class="text-sm text-muted">
      Daily Menus support browsing. Ordering is not available for daily
      selections.
    </p>
    <p v-else-if="menu.doc?.url.trim()" class="text-sm text-muted">
      Document Menus support browsing. Ordering needs items and prices.
    </p>
    <p v-else-if="menu.status !== 'published'" class="text-sm text-muted">
      Publish this Menu before guests can use it in a offering.
    </p>
    <UCard v-for="entry in entries" :key="entry.id">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-2">
          <h3 class="font-semibold">{{ entry.label }}</h3>
          <UBadge
            :color="entry.state === 'Enabled' ? 'success' : 'neutral'"
            variant="subtle"
            >{{ entry.state }}</UBadge
          >
        </div>
        <UButton
          :to="entry.configurePath"
          :aria-label="'Configure ' + entry.label"
          label="Configure"
          color="neutral"
          variant="soft"
          trailing-icon="i-lucide-chevron-right"
        />
      </div>
      <ul class="mt-3 divide-y divide-default">
        <li
          v-for="interaction in entry.interactions"
          :key="interaction.type"
          class="flex flex-wrap items-center justify-between gap-3 py-2"
        >
          <div class="flex flex-wrap items-center gap-2">
            <span>{{ interaction.label }}</span>
            <UBadge
              :color="interaction.state === 'Paused' ? 'warning' : 'neutral'"
              variant="subtle"
              >{{ interaction.state }}</UBadge
            >
            <span
              v-if="entry.state === 'Off' && interaction.state === 'Enabled'"
              class="text-xs text-muted"
              >Offering is off</span
            >
            <span v-if="interaction.diagnostic" class="text-xs text-muted"
              >Customer flow not ready</span
            >
          </div>
          <UButton
            v-if="interaction.customerUrl"
            :to="interaction.customerUrl"
            target="_blank"
            :label="
              interaction.type === 'browse' ? 'View Menu' : 'View ordering'
            "
            icon="i-lucide-external-link"
            color="neutral"
            variant="ghost"
          />
          <UButton
            v-else-if="interaction.kiosk"
            to="/workspace/kitchen/settings/kiosks"
            label="Kiosk devices"
            color="neutral"
            variant="ghost"
          />
        </li>
      </ul>
    </UCard>
  </section>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useRequestURL } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useKitchenMenuRecordContext } from '../../../../composables/workspace/menus/useKitchenMenuRecordContext'
import {
  directoryMenuRouteScope,
  tenantMenuRouteScope,
} from '../../../../../menu/utils/menu-route'
import { menuWebsiteOrigin } from '../../../../utils/menu-website-snippet'
import { menuOfferingSummaries } from '../../../../utils/menu-offering-summary'
const { menu, selectedKitchen, pending, error, offerings, offeringsOutcome } =
  useKitchenMenuRecordContext()
const fireux = useFireUXConfig()
const origin = menuWebsiteOrigin(useRequestURL().origin, fireux.siteUrl)
const entries = computed(() =>
  menu.value
    ? menuOfferingSummaries({
        menu: menu.value,
        offerings: offerings.value,
        scope: fireux.isTenant
          ? tenantMenuRouteScope()
          : directoryMenuRouteScope(selectedKitchen.value?.slug),
        origin,
      })
    : []
)
</script>
