<template>
  <section id="menu" class="template-one-menu" :style="style" data-landing-scene="menu">
    <div class="template-one-menu__intro" data-landing-reveal="up">
      <div>
        <h2>Menu</h2>
        <span aria-hidden="true" />
        <p v-if="content.menu.description">{{ content.menu.description }}</p>
        <NuxtLink v-if="content.menuHref && content.menuActionLabel" :to="content.menuHref">
          {{ content.menuActionLabel }}
        </NuxtLink>
      </div>
      <img v-if="introItem?.imageUrl" :src="introItem.imageUrl" alt="" loading="lazy">
    </div>

    <div class="template-one-menu__grid" data-landing-reveal="up" style="--landing-reveal-delay: 80ms">
      <TemplateOneDishCard v-for="item in dishes" :key="item.id" :item="item" />
      <TemplateOneDishCard
        v-if="specialItem"
        :item="specialItem"
        :eyebrow="content.specials?.name"
        featured
      />
    </div>

    <article v-if="makeItYours" class="template-one-menu__make-it-yours" data-landing-reveal="scale">
      <div>
        <p>+</p>
        <h3>{{ makeItYours.name }}</h3>
      </div>
      <p>{{ addOnLabels }}</p>
    </article>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AppPalette, AppTypography, TemplateOneMenuContent } from './template-one'
import TemplateOneDishCard from './TemplateOneDishCard.vue'

const props = defineProps<{
  content: TemplateOneMenuContent
  palette: AppPalette
  typography: AppTypography
}>()

const items = computed(() => props.content.menu.sections.flatMap(section => section.items))
const makeItYours = computed(() => props.content.makeItYours ?? items.value.find(item => item.addOns.length > 0) ?? null)
const dishes = computed(() => items.value.filter(item => item.id !== makeItYours.value?.id))
const introItem = computed(() => dishes.value[0])
const specialItem = computed(() => props.content.specials?.sections.flatMap(section => section.items)[0] ?? null)
const addOnLabels = computed(() => {
  const labels = makeItYours.value?.addOns.map(addOn => addOn.label) ?? []
  return labels.length ? `${labels.join('. ')}.` : ''
})
const style = computed(() => ({
  '--template-one-primary': props.palette.canvas,
  '--template-one-text': props.palette.text,
  '--template-one-muted': props.palette.text_muted,
  '--template-one-accent': props.palette.accent,
  '--template-one-display-family': props.typography.display_family,
  '--template-one-body-family': props.typography.body_family,
}))
</script>

<style scoped src="./assets/styles/template-one-menu.css"></style>
