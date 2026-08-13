<template>
  <main
    v-if="template"
    class="template-one-page"
    :class="{ 'template-one-page--preview': isTemplatePreview }"
  >
    <nav
      class="template-one-page__inheritance"
      aria-label="Presentation inheritance"
    >
      <span>Inherited surface</span>
      <ol>
        <li v-for="(level, index) in presentationPath" :key="level">
          <span v-if="index" aria-hidden="true">→</span>
          <strong>{{ level }}</strong>
        </li>
      </ol>
    </nav>
    <TemplateOnePlacePreview
      :name="placePreview.name"
      :primary-color="placePreview.primaryColor"
      :source="placePreview.source"
      :identity-src="placePreview.identitySrc"
    />
    <TemplateOneKitchenPreview
      :name="selectedKitchen.name"
      :primary-color="placePreview.primaryColor"
      :slug="selectedKitchen.id"
      :identity-src="placePreview.identitySrc"
    />
    <header
      v-if="isTemplatePreview"
      class="template-one-page__preview-shell"
    >
      <nav
        class="template-one-page__preview-toolbar"
        aria-label="Template preview tools"
      >
        <NuxtLink :to="{ path: '/templates', query: { kitchen: selectedKitchenId } }">← Templates</NuxtLink>
        <span>{{ template.name }} preview</span>
        <div>
          <NuxtLink
            v-for="kitchen in appKitchens"
            :key="kitchen.id"
            replace
            :to="{ query: { kitchen: kitchen.id } }"
            :aria-current="kitchen.id === selectedKitchenId ? 'page' : undefined"
          >
            {{ kitchen.name }}
          </NuxtLink>
        </div>
      </nav>
      <TemplateOneHeroProps
        :name="selectedKitchen.name"
        :wordmark-src="selectedKitchen.rootProps.wordmarkSrc"
        :place-primary-color="selectedKitchen.rootProps.placePrimaryColor"
        :present="selectedKitchen.appProps.sceneOne.present"
        :identity-alignment="selectedKitchen.appProps.sceneOne.identityAlignment"
        :tagline="selectedKitchen.appProps.sceneOne.tagline"
      />
      <TemplateOneTypography
        v-if="template.slug === 'template-one'"
        :typography="selectedKitchen.appProps.typography"
      />
      <p class="template-one-page__content-readiness">
        Template content ·
        <strong>{{ templateContentReadiness }}</strong>
      </p>
    </header>
    <template v-if="isTemplatePreview">
      <TemplateOneSceneOne
        :name="selectedKitchen.name"
        :wordmark-src="sceneWordmarkSrc"
        :place-primary-color="selectedKitchen.rootProps.placePrimaryColor"
        :present="selectedKitchen.appProps.sceneOne.present"
        :identity-alignment="selectedKitchen.appProps.sceneOne.identityAlignment"
        :palette="effectivePalette"
        :typography="selectedKitchen.appProps.typography"
        :flagship-dish="flagshipResult?.dish || null"
        :requirements="sceneRequirements"
      />
    </template>
    <UContainer v-else>
      <header class="template-one-page__header">
        <NuxtLink to="/templates">← Templates</NuxtLink>
        <h1>{{ template.name }}.</h1>
      </header>
      <TemplateOneBrandSwitcher
        :model-value="selectedKitchenId"
        :brands="template.brands"
      />
      <TemplateOneAtoms
        :injection="selectedKitchen"
        :menu="templateOneMenuSample"
        :basic-presentation="basicPresentation"
        :presentation-kind="template.kind"
      />
    </UContainer>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { createError } from 'h3'
import TemplateOneKitchenPreview from '~/components/templates/TemplateOneKitchenPreview.vue'
import TemplateOnePlacePreview from '~/components/templates/TemplateOnePlacePreview.vue'
import TemplateOneAtoms from 'fireux-misebox/runtime/TemplateOneAtoms.vue'
import TemplateOneBrandSwitcher from 'fireux-misebox/runtime/TemplateOneBrandSwitcher.vue'
import TemplateOneSceneOne from 'fireux-misebox/runtime/TemplateOneSceneOne.vue'
import TemplateOneTypography from 'fireux-misebox/runtime/TemplateOneTypography.vue'
import {
  findLandingTemplate,
  findLandingTemplateBrand,
  isLandingTemplateBrandId,
  templateOneMenuSample,
} from 'fireux-misebox/runtime/template-one-fixtures'
import type { TemplateOneKitchenSpecimen } from 'fireux-misebox/runtime/template-one'
import { resolveMiseboxKitchenBasicPresentation } from 'fireux-misebox/runtime/kitchen-basic-presentation'
import { miseboxDemoMediaUrl } from 'fireux-demo/runtime/media/misebox'
import { useSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { resolveAppPalette } from 'fireux-core/runtime/utils/brand-palette'
import type { AppPalette } from 'fireux-core/types/theme'
import type { KitchenFlagshipDishResult } from 'fireux-kitchens/runtime/server/dish/flagship-projection'

const route = useRoute()
const template = findLandingTemplate(String(route.params.slug || ''))
if (!template)
  throw createError({ statusCode: 404, statusMessage: 'Template not found' })

const selectedKitchenId = computed<TemplateOneKitchenSpecimen['id']>(() =>
  isLandingTemplateBrandId(String(route.query.kitchen || route.query.brand || ''))
    ? (String(route.query.kitchen || route.query.brand) as TemplateOneKitchenSpecimen['id'])
    : 'seehotel-bonigen'
)
const selectedKitchen = computed<TemplateOneKitchenSpecimen>(
  () => findLandingTemplateBrand(selectedKitchenId.value) || template.brands[0]
)
const isTemplatePreview = computed(() =>
  template.kind === 'template' && Boolean(selectedKitchen.value.appProps)
)
const appKitchens = computed(() =>
  template.brands.filter((kitchen) => kitchen.tier === 'app')
)
const selectedAppProps = computed(() => selectedKitchen.value.appProps)
const { data: flagshipResult } = await useAsyncData(
  'template-one-flagship-dish',
  () => selectedAppProps.value
    ? $fetch<KitchenFlagshipDishResult>(
        `/api/kitchens/${selectedAppProps.value.kitchenId}/flagship-dish`,
        { query: { appId: selectedAppProps.value.appId } }
      )
    : null,
  { watch: [selectedKitchenId] }
)
const effectivePalette = computed<AppPalette>(() => {
  const app = selectedAppProps.value
  const consolePalette = selectedKitchen.value.consoleProps?.palette
  return app && consolePalette
    ? resolveAppPalette(consolePalette, app.palette) || {
        canvas: '#0b0b0a', surface: '#181817', canvas_inverted: '#f8fafc',
        text: '#f8fafc', text_muted: '#94a3b8', ink: '#0b0b0a',
        accent: '#64748b', accent_contrast: '#ffffff',
      }
    : {
        canvas: '#0b0b0a', surface: '#181817', canvas_inverted: '#f8fafc',
        text: '#f8fafc', text_muted: '#94a3b8', ink: '#0b0b0a',
        accent: '#64748b', accent_contrast: '#ffffff',
      }
})
const sceneWordmarkSrc = computed(() => {
  const app = selectedAppProps.value
  if (!app) return ''
  return selectedKitchen.value.demo
    ? miseboxDemoMediaUrl(`apps/${app.appId}/img/app/wordmark-dark.png`)
    : `/api/templates/template-one/assets/wordmarkDark?appId=${encodeURIComponent(app.appId)}`
})
const sceneRequirements = computed(() => ({
  wordmark: Boolean(sceneWordmarkSrc.value),
  palette: Boolean(resolveAppPalette(
    selectedKitchen.value.consoleProps?.palette || effectivePalette.value,
    selectedAppProps.value?.palette || {}
  )),
  typography: Boolean(
    selectedAppProps.value?.typography.display_family &&
    selectedAppProps.value?.typography.body_family
  ),
  flagshipDish: flagshipResult.value?.ready === true,
  pattern: 'unapproved' as const,
}))
const templateContentReadiness = computed(() => {
  const readiness = flagshipResult.value?.contentReadiness
  if (!readiness) return 'Not checked'
  return readiness.ready
    ? `${readiness.eligibleDishCount}/${readiness.requiredDishCount} Dishes · ready`
    : `${readiness.eligibleDishCount}/${readiness.requiredDishCount} Dishes · not ready`
})
const presentationPath = computed(() => {
  const levels = ['Place', 'Kitchen']
  if (template.kind !== 'default' && selectedKitchen.value.tier === 'console') levels.push('Console')
  if (template.kind === 'theme' && selectedKitchen.value.tier === 'app') levels.push('Console')
  if (template.kind === 'template' && selectedKitchen.value.tier === 'app') {
    levels.push('Console', `App + ${template.name}`)
  }
  return levels
})
const { data: rootKitchenResponse } = await useAsyncData(
  'template-one-root-kitchen',
  () => selectedKitchen.value.tier === 'root'
    ? $fetch<{ item: Record<string, unknown> }>(
        `/api/kitchens/${selectedKitchen.value.id}`
      )
    : null,
  { watch: [selectedKitchenId] }
)
const basicPresentation = computed(() => {
  if (selectedKitchen.value.id === 'pizza-the-action') {
    return resolveMiseboxKitchenBasicPresentation({
      name: selectedKitchen.value.name,
      slug: selectedKitchen.value.id,
      logoImageUrl: miseboxDemoMediaUrl(
        'kitchens/pizza-the-action/logo.png'
      ),
    })
  }
  if (selectedKitchen.value.tier !== 'root') return null
  const item = rootKitchenResponse.value?.item || {}
  return resolveMiseboxKitchenBasicPresentation({
    name: String(item.name || selectedKitchen.value.name),
    slug: String(item.slug || selectedKitchen.value.id),
    mediaBackdropColor: String(item.media_backdrop_color || ''),
    placeImageUrl: String(item.place_image_url || item.image_url || ''),
    logoImageUrl: String(item.logo_image_url || ''),
    wordmarkImageUrl: String(item.wordmark_image_url || ''),
  })
})
const placePreview = computed(() => ({
  name: basicPresentation.value?.name || selectedKitchen.value.name,
  primaryColor:
    basicPresentation.value?.placePrimaryColor ||
    selectedKitchen.value.rootProps.placePrimaryColor,
  identitySrc:
    basicPresentation.value?.placeImageSrc ||
    basicPresentation.value?.identityImageSrc ||
    selectedKitchen.value.rootProps.wordmarkSrc,
  source:
    basicPresentation.value
      ? basicPresentation.value.placePrimaryColorSource === 'projected'
        ? 'Authored Place presentation'
        : 'Misebox default Place presentation'
      : selectedKitchen.value.rootProps.source,
}))

definePageMeta({ layout: false, name: 'MiseboxTemplateDetailPage' })
useSeo({
  title: `${template.name} · Misebox`,
  description:
    'Compare the complete Root, Console and App presentation levels.',
  path: `/templates/${template.slug}`,
  image: '/img/app/cover.png',
})
</script>

<style scoped>
.template-one-page {
  min-height: 100svh;
  padding: 0 0 calc(var(--spacing) * 32);
  background: var(--ui-bg-muted);
}
.template-one-page__inheritance {
  display: flex;
  gap: calc(var(--spacing) * 4);
  align-items: center;
  min-height: calc(var(--spacing) * 10);
  padding-inline: clamp(calc(var(--spacing) * 4), 3vw, calc(var(--spacing) * 12));
  color: color-mix(in srgb, white 72%, transparent);
  font-size: var(--text-xs);
  background: #0b0b0a;
  border-bottom: 1px solid rgb(255 255 255 / 10%);
  overflow-x: auto;
}
.template-one-page__inheritance > span {
  flex: 0 0 auto;
  color: color-mix(in srgb, white 46%, transparent);
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
}
.template-one-page__inheritance ol,
.template-one-page__inheritance li {
  display: flex;
  flex: 0 0 auto;
  gap: calc(var(--spacing) * 2);
  align-items: center;
  margin: 0;
  padding: 0;
  list-style: none;
}
.template-one-page__inheritance strong {
  color: white;
  font-weight: var(--font-weight-semibold);
}
.template-one-page--preview {
  padding: 0;
  background: #0b0b0a;
}
.template-one-page :deep(.container) {
  display: grid;
  max-width: 64rem;
  gap: calc(var(--spacing) * 8);
  padding-top: calc(var(--spacing) * 20);
}
.template-one-page__header {
  display: grid;
  gap: calc(var(--spacing) * 4);
}
.template-one-page__header a {
  width: fit-content;
  color: var(--ui-text-muted);
}
.template-one-page__content-readiness {
  margin: 0;
  padding: calc(var(--spacing) * 3) clamp(calc(var(--spacing) * 4), 3vw, calc(var(--spacing) * 12));
  color: color-mix(in srgb, white 62%, transparent);
  font-size: var(--text-sm);
  background: #0b0b0a;
  border-top: 1px solid rgb(255 255 255 / 10%);
}
.template-one-page__content-readiness strong {
  color: white;
}
.template-one-page h1 {
  margin: 0;
  font-size: clamp(var(--text-5xl), 10vw, var(--text-9xl));
  letter-spacing: -0.07em;
  line-height: 0.9;
}
</style>
<style scoped src="./template-detail-toolbar.css"></style>
