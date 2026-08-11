<!-- Concurrent edit — 2026-07-19 16:49 CEST — Repo Efficiency Pass 5 of 6: Kitchen dual-source outcome contract. -->
<!-- Concurrent edit — 2026-07-21 21:23 CEST — Console index parity: restore the shared selected-target clear contract. -->
<template>
  <section class="console-surface console-surface--compact">
    <ConsoleKitchenIndexSelected
      :kitchen="selection.kitchen"
      :kitchen-id="selection.kitchenId"
      :source="selection.kitchenSource"
      :outcome="selection.outcome"
      :clearable="!sections.locked"
      @clear="actions.clear"
    />

    <ConsoleKitchenIndexTargets
      v-if="sections.targets.show"
      :collection="sections.targets.collection"
      :demo-collection="sections.demoTargets.collection"
      :outcome="sections.targets.outcome"
      :demo-outcome="sections.demoTargets.outcome"
      :selected-id="selection.kitchenId"
      :selected-source="selection.kitchenSource"
      @select="actions.selectTarget"
    />

    <ConsoleKitchenIndexApps
      v-if="sections.kitchenApps.show"
      :collection="sections.kitchenApps.collection"
    />

    <DevFireuxDebugPanel
      title="Kitchen console debug"
      scope="console"
      :data="debug"
      :descriptions="debugDescriptions"
      :default-open="false"
    />
  </section>
</template>

<script setup lang="ts">
import { useKitchenConsoleIndex } from '../../../../composables/fireux/console/kitchen/index/useKitchenConsoleIndex'

const { selection, sections, actions, debug } = useKitchenConsoleIndex()

const debugDescriptions = {
  'consoleKitchen.workspace':
    'The App attachment and derived collection boundary used by the selected Kitchen workspace.',
  'consoleKitchen.workspace.app':
    'The host App and the selected Kitchen’s attachment role in that App.',
  'consoleKitchen.workspace.collection':
    'The collection boundary used by Console operations. It is null until selection resolves.',
  'consoleKitchen.workspace.collection.root':
    'The canonical Kitchen root collection shared by every App: kitchens.',
  'consoleKitchen.workspace.collection.scoped':
    'The App-derived operational Kitchen collection used for child records.',
  'consoleKitchen.selectedKitchen':
    'The selected Kitchen and every Console value derived from that target.',
  'consoleKitchen.selectedKitchen.source':
    'The committed Kitchen source. It is null with no selection, live for operational data, or demo for read-only Demo data.',
  'consoleKitchen.selectedKitchen.userAccess':
    'The current User’s write capability for this Kitchen. It may differ between Kitchens.',
  'consoleKitchen.user':
    'The authenticated subject used to request bounded Console targets.',
  'consoleKitchen.user.authentication':
    'The resolved Firebase identity used to request this User’s bounded Kitchen targets.',
  'consoleKitchen.myKitchens':
    'Live Kitchens returned by the authenticated server projection for the current User and App.',
  'consoleKitchen.demoKitchens':
    'Package-owned deterministic read-only Kitchens available for product exploration.',
  'consoleKitchen.myKitchenApps':
    'Apps attached to Kitchens available to the current User in the ecosystem Console.',
  'consoleKitchen.myKitchenApps.endpoint':
    'The server endpoint that returns safe App summaries alongside My Kitchens.',
  'consoleKitchen.myKitchenApps.action':
    'Clicking an item opens that App; it never selects the Kitchen workspace.',
  'consoleKitchen.myKitchenApps.route':
    'The local App detail route used when opening a Kitchen App resource.',
  'consoleKitchen.myKitchenApps.visible':
    'Whether this resource section is currently rendered in the Console.',
}
</script>
