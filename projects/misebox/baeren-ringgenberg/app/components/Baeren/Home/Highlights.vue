<template>
  <div class="grid gap-4 md:grid-cols-3">
    <UPageCard
      v-for="highlight in highlights"
      :key="highlight.to"
      :title="highlight.title"
      :description="highlight.description"
      :to="highlight.to"
      :icon="highlight.icon"
    />
  </div>
</template>

<script setup lang="ts">
import { baerenRinggenbergContent } from '../../../config/content.config'

const highlights = baerenRinggenbergContent.pages.home.highlights
</script>
