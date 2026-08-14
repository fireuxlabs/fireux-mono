<template>
  <TemplateOneMenuSection
    v-if="manifest"
    :content="content"
    :palette="palette"
    :typography="typography"
  />
</template>

<script setup lang="ts">
import TemplateOneMenuSection from 'fireux-misebox/runtime/TemplateOneMenuSection.vue'
import type { MenuDetailPayload } from 'fireux-kitchens/runtime/models/kitchen/menu/menu-detail.model'

const { data } = await useFetch<MenuDetailPayload>('/api/menus/friiites')
const manifest = computed(() => data.value?.kind === 'manifest' ? data.value.manifest : null)
const content = computed(() => ({
  menu: manifest.value!.content,
  specials: manifest.value!.specials,
  menuHref: '/menus',
  menuActionLabel: 'Browse menu',
}))
const palette = {
  canvas: '#181817', surface: '#242321', canvas_inverted: '#f3e9d2',
  text: '#f3e9d2', text_muted: '#bdb6a5', ink: '#181817',
  accent: '#d99a22', accent_contrast: '#181817',
}
const typography = {
  display_family: "Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif",
  body_family: "'Arial Narrow', Arial, sans-serif",
}
</script>
