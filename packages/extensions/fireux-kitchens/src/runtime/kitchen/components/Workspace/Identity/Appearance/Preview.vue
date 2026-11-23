<template>
  <div
    class="appearance-preview"
    :style="{
      '--preview-bg': palette.canvas,
      '--preview-text': palette.text,
      '--preview-accent': palette.accent,
      '--preview-on-accent': palette.accent_contrast,
    }"
  >
    <div class="appearance-preview__brand">
      <img
        v-if="imageUrl"
        :src="imageUrl"
        alt=""
        :class="{ 'appearance-preview__logo': imageFit === 'contain' }"
        :style="{
          objectFit: imageFit || 'cover',
          backgroundColor: imageFit === 'contain' ? imageBackground : undefined,
        }"
      />
      <span v-else class="appearance-preview__monogram">{{
        name.slice(0, 1)
      }}</span>
      <span>{{ name }}</span>
    </div>
    <template v-if="menu">
      <h2>{{ menu.name }}</h2>
      <p v-if="menu.description">{{ menu.description }}</p>
      <section v-if="item" class="appearance-preview__section">
        <h3>{{ section?.label }}</h3>
        <div class="appearance-preview__item">
          <div>
            <h4>{{ item.name }}</h4>
            <p v-if="item.description">{{ item.description }}</p>
          </div>
        </div>
      </section>
    </template>
    <p v-else-if="menuOutcome === 'error'" role="alert">
      Could not load a menu for this preview.
    </p>
    <p
      v-else-if="menuOutcome === 'pending' || menuOutcome === 'idle'"
      role="status"
    >
      Loading menu preview…
    </p>
    <template v-else>
      <h2>A taste of<br />your Kitchen.</h2>
      <p>Your food, your story, your colours.</p>
      <div class="appearance-preview__item">
        <div>
          <h3>Seasonal favourites</h3>
          <p>A little sample of your menu’s look and feel.</p>
        </div>
        <UIcon name="i-lucide-leaf" />
      </div>
    </template>
  </div>
</template>
<script setup lang="ts">
import type { WorkspacePalette } from 'fireux-core/types/theme'
import { computed } from 'vue'
import { readRuntimeFirestoreDatabaseId } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { useMenuSectionCollection } from '../../../../../menu/composables/useMenuSectionCollection'
import { useMenuEntryCollection } from '../../../../../menu/composables/useMenuEntryCollection'
import { useKitchenItemRead } from '../../../../composables/items/useKitchenItemRead'

const props = defineProps<{
  palette: WorkspacePalette
  name: string
  kitchenId?: string
  menu?: { id: string; name: string; description?: string }
  menuOutcome?: string
  imageUrl?: string
  imageFit?: 'contain' | 'cover'
  imageBackground?: string
}>()

const kitchenId = computed(() => props.kitchenId || '')
const menuId = computed(() => props.menu?.id || '')
const options = {
  kitchenCollectionPath: 'kitchens',
  databaseId: readRuntimeFirestoreDatabaseId(),
}
const sections = useMenuSectionCollection(kitchenId, menuId, options)
const section = computed(() =>
  sections.outcome.value === 'ready' ? sections.sections.value[0] : undefined
)
const sectionId = computed(() => section.value?.id || '')
const items = useMenuEntryCollection(
  kitchenId,
  menuId,
  sectionId,
  options
)
const itemId = computed(() =>
  items.outcome.value === 'ready'
    ? items.items.value.find((item) => item.item_id)?.item_id || ''
    : ''
)
const { item } = useKitchenItemRead(kitchenId, itemId)
</script>
<style scoped>
.appearance-preview {
  background: var(--preview-bg);
  color: var(--preview-text);
  border: 1px solid color-mix(in srgb, var(--preview-text) 14%, transparent);
  border-radius: 1.5rem;
  padding: clamp(1.5rem, 3vw, 3rem);
  overflow: hidden;
}
.appearance-preview__brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 3rem;
}
.appearance-preview__brand img,
.appearance-preview__monogram {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 0.75rem;
  object-fit: contain;
}
.appearance-preview__logo {
  padding: 0.25rem;
}
.appearance-preview__monogram {
  display: grid;
  place-items: center;
  background: var(--preview-accent);
  color: var(--preview-on-accent);
}
.appearance-preview h2 {
  font-size: clamp(2.25rem, 4vw, 3.5rem);
  line-height: 1.07;
  letter-spacing: -0.045em;
  font-weight: 600;
  margin: 1rem 0;
}
.appearance-preview p {
  opacity: 0.7;
  font-size: 0.9rem;
  line-height: 1.6;
}
.appearance-preview__item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem 0;
}
.appearance-preview h3 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.35rem;
}
.appearance-preview__section {
  margin-top: calc(var(--spacing) * 6);
}
.appearance-preview__section h3 {
  padding-bottom: calc(var(--spacing) * 2);
  border-bottom: 2px solid var(--preview-accent);
}
.appearance-preview h4 {
  font-weight: var(--font-weight-semibold);
}
</style>
