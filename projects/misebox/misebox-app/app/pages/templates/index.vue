<template>
  <main class="catalogue">
    <UContainer>
      <header>
        <p>Templates and theming</p>
        <h1>Select a Kitchen. Compare templates.</h1>
        <span>Kitchen supplies the identity and assets. Each template decides how to present them.</span>
      </header>

      <section aria-labelledby="kitchen-title">
        <div><small>Step 1</small><h2 id="kitchen-title">Kitchen</h2></div>
        <nav aria-label="Select Kitchen">
          <NuxtLink
            v-for="kitchen in kitchens"
            :key="kitchen.id"
            replace
            :to="{ query: { kitchen: kitchen.id } }"
            :aria-current="kitchen.id === selectedKitchen.id ? 'true' : undefined"
          >
            <strong>{{ kitchen.name }}</strong>
            <small>{{ kitchen.tier }}{{ kitchen.demo ? ' · Demo' : '' }}</small>
          </NuxtLink>
        </nav>
        <TemplateOneAssetReadiness
          :name="selectedKitchen.name"
          :stage="selectedKitchen.tier"
          :sources="assetSources"
          :storage-readiness="appAssetReadiness"
          :storage-pending="appAssetsPending"
          :storage-error="appAssetsError"
          :authority="selectedKitchen.demo ? 'demo' : 'app'"
        />
      </section>

      <TemplatePaletteProgression :kitchen="selectedKitchen" />
      <TemplateTypographyProgression :kitchen="selectedKitchen" />

      <section aria-labelledby="template-title">
        <div><small>Step 2</small><h2 id="template-title">Template</h2></div>
        <div class="catalogue__templates">
          <article v-for="item in templates" :key="item.slug">
            <small>{{ item.status }}</small>
            <h3>{{ item.name }}</h3>
            <p>{{ item.summary }}</p>
            <small>{{ requirementLabel(item.minimumTier) }}</small>
            <UButton
              :to="isAvailable(item.minimumTier) ? { path: `/templates/${item.slug}`, query: { kitchen: selectedKitchen.id } } : undefined"
              :disabled="!isAvailable(item.minimumTier)"
            >
              Preview with {{ selectedKitchen.name }}
            </UButton>
          </article>
        </div>
      </section>
    </UContainer>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import TemplateOneAssetReadiness from '~/components/templates/TemplateOneAssetReadiness.vue'
import TemplatePaletteProgression from '~/components/templates/TemplatePaletteProgression.vue'
import TemplateTypographyProgression from '~/components/templates/TemplateTypographyProgression.vue'
import { useSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import type { EntityAssetSourceMap } from 'fireux-core/runtime/models/operations/entity-asset-onboarding'
import { miseboxDemoMediaUrl } from 'fireux-demo/runtime/media/misebox'
import { useTemplateOneAppAssetReadiness } from '~/composables/templates/useTemplateOneAppAssetReadiness'
import {
  findLandingTemplateBrand,
  isLandingTemplateBrandId,
  landingTemplateBrands,
  landingTemplates,
} from 'fireux-misebox/runtime/template-one-fixtures'

const route = useRoute()
const kitchens = landingTemplateBrands
const templates = landingTemplates
const tierRank = { root: 0, console: 1, app: 2 } as const
const isAvailable = (minimumTier: keyof typeof tierRank) =>
  tierRank[selectedKitchen.value.tier] >= tierRank[minimumTier]
const requirementLabel = (minimumTier: keyof typeof tierRank) =>
  minimumTier === 'root' ? 'Root and above' : minimumTier === 'console' ? 'Console and App' : 'App only'
const selectedKitchen = computed(() => {
  const id = String(route.query.kitchen || '')
  return isLandingTemplateBrandId(id) ? findLandingTemplateBrand(id)! : kitchens[0]
})
const selectedKitchenId = computed(() => selectedKitchen.value.id)
const { readiness: appAssetReadiness, pending: appAssetsPending, error: appAssetsError } =
  await useTemplateOneAppAssetReadiness(
    selectedKitchenId,
    computed(() => Boolean(selectedKitchen.value.appProps && !selectedKitchen.value.demo))
  )
const { data: rootKitchenResponse } = await useAsyncData(
  'template-catalogue-root-kitchen',
  () => selectedKitchen.value.tier === 'root'
    ? $fetch<{ item: Record<string, unknown> }>(`/api/kitchens/${selectedKitchen.value.id}`)
    : null,
  { watch: [selectedKitchenId] }
)
const assetSources = computed<EntityAssetSourceMap>(() => {
  const sources = Object.fromEntries(
    Object.entries(selectedKitchen.value.assetSources).map(([role, source]) => [
      role,
      source.startsWith('demo:') ? miseboxDemoMediaUrl(source.slice(5)) : source,
    ])
  ) as EntityAssetSourceMap
  const item = rootKitchenResponse.value?.item || {}
  return selectedKitchen.value.tier === 'root' && item.logo_image_url
    ? { ...sources, logo: String(item.logo_image_url) }
    : sources
})

definePageMeta({ layout: 'landing', name: 'MiseboxTemplatesIndexPage' })
useSeo({
  title: 'Restaurant Templates · Misebox',
  description: 'Select a Kitchen and compare reusable restaurant templates using the same identity inputs.',
  path: '/templates',
  image: '/img/app/cover.png',
})
</script>

<style scoped>
.catalogue { min-height: 100svh; padding: clamp(calc(var(--spacing) * 24), 12vw, calc(var(--spacing) * 40)) 0; background: var(--ui-bg); }
.catalogue :deep(.container), header, section { display: grid; gap: calc(var(--spacing) * 6); }
header { max-width: 56rem; }
header > p, section > div small, article > small { color: var(--ui-primary); font-size: var(--text-xs); font-weight: var(--font-weight-extrabold); letter-spacing: var(--tracking-widest); text-transform: uppercase; }
h1 { max-width: 14ch; margin: 0; font-size: clamp(var(--text-5xl), 8vw, var(--text-8xl)); letter-spacing: -.065em; line-height: .94; }
header > span, article p { color: var(--ui-text-muted); }
section { margin-top: calc(var(--spacing) * 12); padding-top: calc(var(--spacing) * 8); border-top: 1px solid var(--ui-border); }
section h2, article h3 { margin: calc(var(--spacing) * 1) 0 0; }
nav, .catalogue__templates { display: grid; grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr)); gap: calc(var(--spacing) * 3); }
nav a, article { display: grid; gap: calc(var(--spacing) * 2); padding: calc(var(--spacing) * 4); color: inherit; background: var(--ui-bg-muted); border: 1px solid var(--ui-border); border-radius: var(--ui-radius); text-decoration: none; }
nav a[aria-current='true'] { border-color: var(--ui-primary); box-shadow: inset 0 0 0 1px var(--ui-primary); }
nav small { color: var(--ui-text-muted); text-transform: capitalize; }
article { align-content: start; min-height: calc(var(--spacing) * 60); padding: calc(var(--spacing) * 6); }
article :deep(a) { align-self: end; width: fit-content; margin-top: auto; }
</style>
