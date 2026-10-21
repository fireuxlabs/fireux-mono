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
    <span class="appearance-preview__eyebrow">Colour preview</span>
    <h2>A taste of<br />your Kitchen.</h2>
    <p>Your food, your story, your colours.</p>
    <div class="appearance-preview__tabs">
      <span>Menu</span><span>About</span><span>Visit</span>
    </div>
    <div class="appearance-preview__item">
      <div>
        <h3>Seasonal favourites</h3>
        <p>A little sample of your menu’s look and feel.</p>
      </div>
      <UIcon name="i-lucide-leaf" class="size-6" />
    </div>
    <span class="appearance-preview__button"
      >Explore the menu <UIcon name="i-lucide-arrow-right"
    /></span>
  </div>
</template>
<script setup lang="ts">
import type { WorkspacePalette } from 'fireux-core/types/theme'
defineProps<{
  palette: WorkspacePalette
  name: string
  imageUrl?: string
  imageFit?: 'contain' | 'cover'
  imageBackground?: string
}>()
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
.appearance-preview__eyebrow {
  font-size: 0.65rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
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
.appearance-preview__tabs {
  display: flex;
  gap: 1.5rem;
  border-bottom: 1px solid
    color-mix(in srgb, var(--preview-text) 15%, transparent);
  margin-top: 2rem;
  font-size: 0.8rem;
}
.appearance-preview__tabs span {
  padding: 0.75rem 0;
}
.appearance-preview__tabs span:first-child {
  border-bottom: 2px solid var(--preview-accent);
  font-weight: 600;
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
.appearance-preview__button {
  display: inline-flex;
  align-items: center;
  gap: 1.5rem;
  margin-top: 0.5rem;
  padding: 0.85rem 1.2rem;
  background: var(--preview-accent);
  color: var(--preview-on-accent);
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
}
</style>
