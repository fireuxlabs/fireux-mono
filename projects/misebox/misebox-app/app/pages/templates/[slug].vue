<template>
  <main v-if="template" class="template-one-page">
    <UContainer>
      <header class="template-one-page__header">
        <NuxtLink to="/templates">← Templates</NuxtLink>
        <h1>Template One.</h1>
      </header>

      <TemplateOneBrandSwitcher
        :model-value="selectedKitchenId"
        :brands="template.brands"
      />

      <TemplateOneAtoms :injection="selectedKitchen" />
    </UContainer>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { createError } from 'h3'
import { useRoute } from 'vue-router'
import TemplateOneAtoms from 'fireux-misebox/runtime/TemplateOneAtoms.vue'
import TemplateOneBrandSwitcher from 'fireux-misebox/runtime/TemplateOneBrandSwitcher.vue'
import {
  findLandingTemplate,
  findLandingTemplateBrand,
  isLandingTemplateBrandId,
} from 'fireux-misebox/runtime/template-one-fixtures'
import type { TemplateOneBrandInjection } from 'fireux-misebox/runtime/template-one'
import { useSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'

const route = useRoute()
const template = findLandingTemplate(String(route.params.slug || ''))
if (!template)
  throw createError({ statusCode: 404, statusMessage: 'Template not found' })

const selectedKitchenId = computed<TemplateOneBrandInjection['id']>(() =>
  isLandingTemplateBrandId(String(route.query.brand || ''))
    ? (route.query.brand as TemplateOneBrandInjection['id'])
    : 'basic-kitchen'
)
const selectedKitchen = computed(
  () => findLandingTemplateBrand(selectedKitchenId.value) || template.brands[0]
)

definePageMeta({ layout: 'landing', name: 'MiseboxTemplateDetailPage' })
useSeo({
  title: 'Template One · Misebox',
  description:
    'Compare Basic, Console and App Kitchen presentation through Template One.',
  path: '/templates/template-one',
  image: '/img/app/cover.png',
})
</script>

<style scoped>
.template-one-page {
  min-height: 100svh;
  padding: calc(var(--spacing) * 20) 0 calc(var(--spacing) * 32);
  background: var(--ui-bg-muted);
}
.template-one-page :deep(.container) {
  display: grid;
  max-width: 64rem;
  gap: calc(var(--spacing) * 8);
}
.template-one-page__header {
  display: grid;
  gap: calc(var(--spacing) * 4);
}
.template-one-page__header a {
  width: fit-content;
  color: var(--ui-text-muted);
}
.template-one-page h1 {
  margin: 0;
  font-size: clamp(var(--text-5xl), 10vw, var(--text-9xl));
  letter-spacing: -0.07em;
  line-height: 0.9;
}
</style>
