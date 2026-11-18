<template>
  <section class="workspace-surface" aria-label="Menu preparation">
    <UAlert
      title="Prepare your own Menu"
      description="Upload or link your source, review the draft, then publish and download its QR. Processing uses your Kitchen’s existing allowance."
    />
    <template v-if="outcome === 'ready'">
      <KitchenMenuMenusCreate />
      <h2>Continue a saved source</h2>
      <FireState
        :outcome="sourceOutcome"
        entity="menu sources"
        :error="menuSourcesError"
      />
      <UPageLinks v-if="sources.length" :links="sources" />
      <UButton to="/workspace/kitchen/menu" variant="outline"
        >Review and publish prepared Menus</UButton
      >
      <UButton to="/workspace/kitchen/qr" variant="outline"
        >Download Menu QR</UButton
      >
    </template>
    <FireState v-else :outcome="outcome" entity="Kitchen" :error="error" />
  </section>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useKitchenMenus } from '../../../composables/workspace/menus/useKitchenMenus'
import { useKitchenWorkspaceMenuSources } from '../../../composables/workspace/menus/useKitchenWorkspaceMenuSources'
const { outcome, error } = useKitchenMenus()
const {
  menuSources,
  menuSourcesError,
  outcome: sourceOutcome,
} = useKitchenWorkspaceMenuSources()
const sources = computed(() =>
  menuSources.value.map((source) => ({
    label: source.file_name || 'Menu source',
    icon: 'i-lucide-file-search',
    to: `/workspace/kitchen/menu/uploads/${encodeURIComponent(source.id)}`,
  }))
)
</script>

<style src="../../../../menu/assets/styles/menu-editor.css"></style>
