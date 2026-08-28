<template>
  <section id="misebox" class="template-one-lower template-one-provider" data-landing-scene="provider">
    <div data-scene-layer="content" data-landing-reveal="left"><h2>{{ content.title }}</h2><p>{{ content.description }}</p></div>
    <a :href="content.href" target="_blank" rel="noopener noreferrer" :aria-label="`Visit ${content.name}`" data-landing-reveal="right">
      <AppBrandWordmark :light-src="content.wordmarkLightSrc" :dark-src="content.wordmarkDarkSrc" :alt="content.name" size="large" />
    </a>
  </section>
</template>

<script setup lang="ts">
import type { TemplateOneKitchenProjection } from '../../models/template-one'
defineProps<{ content: TemplateOneKitchenProjection['provider'] }>()
</script>
