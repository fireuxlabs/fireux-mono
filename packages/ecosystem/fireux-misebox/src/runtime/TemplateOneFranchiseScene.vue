<template>
  <section id="franchise" class="template-one-lower template-one-franchise" data-landing-scene="franchise">
    <div data-scene-layer="content" data-landing-reveal="left"><h2>{{ content.title }}</h2><p>{{ content.description }}</p><span>{{ content.actionLabel }}</span></div>
    <div class="template-one-franchise__media" data-landing-reveal="right">
      <img v-for="item in content.media" :key="item.src" :src="item.src" :alt="item.alt" loading="lazy">
    </div>
  </section>
</template>

<script setup lang="ts">
import type { TemplateOneKitchenProjection } from './template-one'
defineProps<{ content: TemplateOneKitchenProjection['franchise'] }>()
</script>
