<template>
  <section
    v-if="menu && !pending && !error && selectedKitchen"
    id="menu-offerings"
    class="workspace-surface workspace-surface--compact"
    aria-labelledby="menu-offerings-title"
  >
    <header class="menu-editor-actions">
      <div>
        <h2 id="menu-offerings-title" class="fx-type-card-heading">
          Linked offerings
        </h2>
        <p class="fx-type-caption">Kitchen offerings using this Menu.</p>
      </div>
      <UButton
        to="/workspace/kitchen/food-and-drink/services"
        label="Manage services"
        color="neutral"
        variant="outline"
        trailing-icon="i-lucide-arrow-up-right"
      />
    </header>
    <FireState
      v-if="!['ready', 'empty'].includes(offeringsOutcome)"
      :outcome="offeringsOutcome"
      :error="offeringsError"
      entity="offerings"
    />
    <p v-else-if="!entries.length" class="fx-type-caption">
      This Menu is not linked to a offering.
    </p>
    <p v-if="menu.schedule === 'daily'" class="fx-type-caption">
      Daily Menus support browsing. Ordering is not available for daily
      selections.
    </p>
    <p v-else-if="menu.doc?.url.trim()" class="fx-type-caption">
      Document Menus support browsing. Ordering needs items and prices.
    </p>
    <p v-else-if="menu.status !== 'published'" class="fx-type-caption">
      Publish this Menu before guests can use it in a offering.
    </p>
    <UCard v-for="entry in entries" :key="entry.id">
      <div class="menu-editor-actions">
        <div class="menu-editor-actions">
          <h3 class="fx-type-card-heading">{{ entry.label }}</h3>
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
      <ul class="menu-editor-list">
        <li
          v-for="interaction in entry.interactions"
          :key="interaction.type"
          class="menu-editor-actions"
        >
          <div class="menu-editor-actions">
            <span>{{ interaction.label }}</span>
            <UBadge
              :color="interaction.state === 'Paused' ? 'warning' : 'neutral'"
              variant="subtle"
              >{{ interaction.state }}</UBadge
            >
            <span
              v-if="entry.state === 'Off' && interaction.state === 'Enabled'"
              class="fx-type-caption"
              >Offering is off</span
            >
            <span v-if="interaction.diagnostic" class="fx-type-caption"
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
const {
  menu,
  selectedKitchen,
  pending,
  error,
  offerings,
  offeringsOutcome,
  offeringsError,
} = useKitchenMenuRecordContext()
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
