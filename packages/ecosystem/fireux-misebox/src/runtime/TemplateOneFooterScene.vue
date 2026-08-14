<template>
  <footer id="footer" class="template-one-footer" data-landing-scene="footer">
    <div class="template-one-footer__lead" data-scene-layer="content">
      <img class="template-one-footer__wordmark" :src="wordmarkSrc" :alt="name" loading="lazy">
      <div><p class="template-one-footer__eyebrow">{{ content.eyebrow }}</p><h2>{{ content.title }}</h2><p>{{ content.description }}</p>
        <NuxtLink class="template-one-footer__console" :to="content.consoleTo">{{ content.consoleLabel }} <span aria-hidden="true">→</span></NuxtLink>
      </div>
    </div>
    <a class="template-one-footer__provider" :href="provider.href" target="_blank" rel="noopener noreferrer">
      <span>Powered by</span><AppBrandWordmark :light-src="provider.wordmarkLightSrc" :dark-src="provider.wordmarkDarkSrc" :alt="provider.name" size="small" />
    </a>
    <div class="template-one-footer__base"><nav aria-label="Footer navigation"><NuxtLink v-for="item in content.links" :key="item.label" :to="item.to">{{ item.label }}</NuxtLink></nav><p>{{ content.origin }}</p></div>
  </footer>
</template>

<script setup lang="ts">
import type { TemplateOneKitchenProjection } from './template-one'
defineProps<{ name: string; wordmarkSrc: string; provider: TemplateOneKitchenProjection['provider']; content: TemplateOneKitchenProjection['footer'] }>()
</script>
