<template>
  <section id="order-now" class="template-one-lower template-one-ordering" data-landing-scene="ordering">
    <header class="template-one-ordering__header" data-scene-layer="content" data-landing-reveal="up">
      <div><p>{{ templateOneOrderingCopy.eyebrow }}</p><h2>{{ templateOneOrderingCopy.title }}</h2></div>
      <p>{{ templateOneOrderingCopy.description }}</p>
    </header>
    <div class="template-one-ordering__artifacts" :aria-label="`${content.surfaces.length} ordering surfaces`" data-landing-reveal="scale">
      <img v-for="item in content.artifacts" :key="item.src" :src="item.src" :alt="item.alt" loading="lazy">
    </div>
    <div class="template-one-ordering__grid" data-landing-reveal="up" style="--landing-reveal-delay: 100ms">
      <NuxtLink v-for="(surface, index) in content.surfaces" :key="surface.label" :to="surface.to">
        <span>0{{ index + 1 }}</span><UIcon v-if="surface.icon" :name="surface.icon" aria-hidden="true" />
        <div><h3>{{ surface.label }}</h3><p>{{ surface.description }}</p></div>
        <strong>{{ surface.action }} <span aria-hidden="true">→</span></strong>
      </NuxtLink>
    </div>
  </section>
</template>

<script setup lang="ts">
import { templateOneOrderingCopy, type TemplateOneKitchenProjection } from '../../models/template-one'
defineProps<{ content: TemplateOneKitchenProjection['ordering'] }>()
</script>
