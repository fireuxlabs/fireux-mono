<template>
  <section data-testid="canonical-menu">
    <h2>Canonical public Menu: {{ renderKind }}</h2>
    <p data-testid="menu-pending">Pending: {{ pending }}</p>
    <p v-if="error" data-testid="menu-error">{{ String(error) }}</p>
    <pre v-if="failure" data-testid="menu-failure">{{
      JSON.stringify(failure)
    }}</pre>
    <pre data-testid="menu-manifest">{{ JSON.stringify(manifest) }}</pre>
    <template v-for="item in items" :key="item.id">
      <img
        v-if="manifest?.presentation.showItemImages && item.imageUrl"
        :src="item.imageUrl"
        :alt="item.name"
        width="96"
        height="64"
      />
    </template>
  </section>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useMenu } from 'fireux-kitchens/runtime/menu/composables/useMenu'

const reader = useMenu('specials', {
  routeScope: { kind: 'directory', kitchenSlug: 'place-000' },
  menuContext: 'generic',
  sproochliLanguage: '',
})
const { manifest, renderKind, pending, error, failure } = reader
const items = computed(
  () =>
    manifest.value?.content.sections.flatMap((section) => section.items) || []
)
await reader.ready
</script>
