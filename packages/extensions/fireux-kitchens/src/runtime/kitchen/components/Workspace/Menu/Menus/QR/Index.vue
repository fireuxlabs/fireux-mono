<template>
  <section class="workspace-surface workspace-surface--compact">
    <FireState
      v-if="
        !['ready', 'empty'].includes(qr.menusOutcome) ||
        !['ready', 'empty'].includes(qr.offeringsOutcome)
      "
      :outcome="qr.outcome"
      :error="qr.error"
      entity="Menu entry points"
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
          to: `/workspace/kitchen/menu/uploads/${encodeURIComponent(qr.draftSource.id)}`,
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
      <KitchenWorkspaceMenuMenusQRPanel
        v-for="panel in qr.menuPanels"
        :key="panel.id"
        :panel="panel"
      />
    </template>
  </section>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useKitchenWorkspaceMenuMenusQr } from '../../../../../composables/workspace/menu/menus/qr'
const qr = reactive(useKitchenWorkspaceMenuMenusQr())
</script>

<style src="../../../../../../menu/assets/styles/menu-editor.css"></style>
