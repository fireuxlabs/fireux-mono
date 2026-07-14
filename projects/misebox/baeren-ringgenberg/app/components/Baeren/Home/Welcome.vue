<template>
  <div class="max-w-3xl space-y-6">
    <img
      :src="content.assets.galleryPreview.src"
      :alt="content.assets.galleryPreview.alt"
      class="size-28 object-contain drop-shadow-xl"
    >

    <div class="baeren-glass space-y-6 rounded-3xl p-6 sm:p-8">
      <div class="space-y-3">
        <h1 class="text-4xl font-bold tracking-tight sm:text-6xl">
          {{ home.title }}
        </h1>
        <p class="max-w-2xl text-lg opacity-85">
          {{ home.intro }}
        </p>
      </div>

      <div class="flex flex-wrap gap-3">
        <UButton
          v-for="action in home.actions"
          :key="action.to"
          :to="action.to"
          :label="action.label"
          :icon="action.icon"
          :color="action.color"
          :variant="action.variant"
          size="xl"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { baerenRinggenbergContent } from '../../../config/content.config'

const content = baerenRinggenbergContent
const home = content.pages.home
</script>

<style scoped>
.baeren-glass {
  border: 1px solid rgb(255 255 255 / 32%);
  background: rgb(15 23 42 / 32%);
  color: white;
  box-shadow: 0 0.85rem 2rem rgb(0 0 0 / 24%);
  backdrop-filter: blur(20px) saturate(120%);
}
</style>
