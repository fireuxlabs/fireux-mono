<template>
  <section class="space-y-4">
    <MoleculesStateCard
      v-if="
        !['ready', 'empty'].includes(qr.menusOutcome) ||
        !['ready', 'empty'].includes(qr.offeringsOutcome)
      "
      :state="
        qr.menusOutcome === 'error' || qr.offeringsOutcome === 'error'
          ? 'error'
          : 'loading'
      "
      :title="
        qr.menusOutcome === 'error' || qr.offeringsOutcome === 'error'
          ? 'Menu entry points unavailable'
          : 'Loading Menu entry points'
      "
    />
    <UAlert
      v-else-if="!qr.menuPanels.length && qr.draftSource"
      color="warning"
      variant="soft"
      icon="i-lucide-file-check-2"
      title="Menu source available"
      description="Review the source, then create and publish its Menu before generating guest entry points."
      :actions="[
        {
          label: 'Review source',
          to: `/workspace/kitchen/food-and-drink/menus/uploads/${encodeURIComponent(qr.draftSource.id)}`,
          icon: 'i-lucide-check-circle-2',
        },
      ]"
    />

    <UAlert
      v-else-if="!qr.menuPanels.length"
      color="neutral"
      variant="soft"
      title="No menus yet"
      description="Create a menu from a source, then publish it before generating guest entry points."
    />

    <template v-else>
      <WorkspaceKitchenMenusQRMenu
        v-for="panel in qr.menuPanels"
        :key="panel.id"
        :panel="panel"
      />
    </template>
  </section>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useMenuQrTargets } from '../../../../composables/workspace/menus/useMenuQrTargets'
const qr = reactive(useMenuQrTargets())
</script>
