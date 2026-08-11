<template>
  <main
    v-if="template"
    class="template-one-page"
    :class="{ 'template-one-page--preview': selectedKitchen.appProps }"
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
      v-if="selectedKitchen.appProps"
      class="template-one-page__preview-shell"
    >
      <nav
        class="template-one-page__preview-toolbar"
        aria-label="Template preview tools"
      >
        <NuxtLink to="/templates/template-one">← Comparison</NuxtLink>
        <span>Template One preview</span>
        <div>
          <NuxtLink
            v-for="kitchen in appKitchens"
            :key="kitchen.id"
            replace
            :to="{ query: { brand: kitchen.id } }"
            :aria-current="kitchen.id === selectedKitchenId ? 'page' : undefined"
          >
            {{ kitchen.name }}
          </NuxtLink>
        </div>
      </nav>
      <aside
        class="template-one-page__level-one"
        aria-label="Level One Hero variables"
      >
      <strong>Level One · Hero</strong>
      <dl>
        <div>
          <dt>Name</dt>
          <dd>{{ selectedKitchen.name }}</dd>
        </div>
        <div>
          <dt>Wordmark</dt>
          <dd>Present</dd>
        </div>
        <div>
          <dt>Place primary</dt>
          <dd>
            <span
              class="template-one-page__colour"
              :style="{ backgroundColor: selectedKitchen.rootProps.placePrimaryColor }"
            />
            <code>{{ selectedKitchen.rootProps.placePrimaryColor }}</code>
          </dd>
        </div>
        <div>
          <dt>Present</dt>
          <dd>{{ selectedKitchen.appProps.sceneOne.present }}</dd>
        </div>
        <div>
          <dt>Alignment</dt>
          <dd>{{ selectedKitchen.appProps.sceneOne.identityAlignment }}</dd>
        </div>
      </dl>
      <small>Header reuses Name + Wordmark. Links are Template One defaults.</small>
      </aside>
    </header>
    <template v-if="selectedKitchen.appProps">
      <TemplateOneSceneOne
        :name="selectedKitchen.name"
        :wordmark-src="selectedKitchen.rootProps.wordmarkSrc"
        :place-primary-color="selectedKitchen.rootProps.placePrimaryColor"
        :present="selectedKitchen.appProps.sceneOne.present"
        :identity-alignment="selectedKitchen.appProps.sceneOne.identityAlignment"
      />
    </template>
    <UContainer v-else>
      <header class="template-one-page__header">
        <NuxtLink to="/templates">← Templates</NuxtLink>
        <h1>Template One.</h1>
      </header>
      <TemplateOneBrandSwitcher
        :model-value="selectedKitchenId"
        :brands="template.brands"
      />
      <TemplateOneAtoms
        :injection="selectedKitchen"
        :menu="templateOneMenuSample"
        :basic-presentation="basicPresentation"
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

const route = useRoute()
const template = findLandingTemplate(String(route.params.slug || ''))
if (!template)
  throw createError({ statusCode: 404, statusMessage: 'Template not found' })

const selectedKitchenId = computed<TemplateOneKitchenSpecimen['id']>(() =>
  isLandingTemplateBrandId(String(route.query.brand || ''))
    ? (route.query.brand as TemplateOneKitchenSpecimen['id'])
    : 'seehotel-bonigen'
)
const selectedKitchen = computed(
  () => findLandingTemplateBrand(selectedKitchenId.value) || template.brands[0]
)
const appKitchens = computed(() =>
  template.brands.filter((kitchen) => kitchen.tier === 'app')
)
const presentationPath = computed(() => {
  const levels = ['Place', 'Kitchen']
  if (selectedKitchen.value.tier === 'console') levels.push('Console')
  if (selectedKitchen.value.tier === 'app') {
    levels.push('Console', 'App + Template One')
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
  title: 'Template One · Misebox',
  description:
    'Compare the complete Root, Console and App presentation levels.',
  path: '/templates/template-one',
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
.template-one-page__preview-shell {
  position: relative;
  z-index: 4;
  color: color-mix(in srgb, white 78%, transparent);
  background: #0b0b0a;
  border-bottom: 1px solid rgb(255 255 255 / 10%);
}
.template-one-page__preview-toolbar {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: calc(var(--spacing) * 3);
  align-items: center;
  min-height: calc(var(--spacing) * 11);
  padding-inline: calc(var(--spacing) * 4);
  color: color-mix(in srgb, white 72%, transparent);
  font-size: var(--text-xs);
  background: rgb(0 0 0 / 62%);
  border-bottom: 1px solid rgb(255 255 255 / 10%);
  backdrop-filter: blur(calc(var(--spacing) * 3));
}
.template-one-page__preview-toolbar > span {
  justify-self: end;
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
}
.template-one-page__preview-toolbar > div {
  display: flex;
  grid-column: 1 / -1;
  gap: calc(var(--spacing) * 3);
  justify-content: flex-start;
  padding-bottom: calc(var(--spacing) * 2.5);
}
.template-one-page__preview-toolbar a[aria-current='page'] {
  color: white;
  text-decoration: underline;
  text-underline-offset: calc(var(--spacing) * 1.5);
}
.template-one-page__level-one {
  display: flex;
  flex-wrap: nowrap;
  gap: calc(var(--spacing) * 4);
  align-items: center;
  padding: calc(var(--spacing) * 2.5) calc(var(--spacing) * 4);
  color: color-mix(in srgb, white 78%, transparent);
  font-size: var(--text-xs);
  background: rgb(0 0 0 / 55%);
  border-top: 1px solid rgb(255 255 255 / 10%);
  backdrop-filter: blur(calc(var(--spacing) * 3));
  overflow-x: auto;
  scrollbar-width: none;
}
.template-one-page__level-one::-webkit-scrollbar {
  display: none;
}
.template-one-page__level-one > strong {
  flex: 0 0 auto;
  color: white;
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
}
.template-one-page__level-one dl {
  display: flex;
  flex: 0 0 auto;
  flex-wrap: nowrap;
  gap: calc(var(--spacing) * 2) calc(var(--spacing) * 5);
  margin: 0;
}
.template-one-page__level-one dl > div {
  display: flex;
  gap: calc(var(--spacing) * 1.5);
}
.template-one-page__level-one dt {
  color: color-mix(in srgb, white 48%, transparent);
}
.template-one-page__level-one dd {
  display: flex;
  gap: calc(var(--spacing) * 1.5);
  align-items: center;
  margin: 0;
  color: white;
}
.template-one-page__level-one small {
  display: none;
  color: color-mix(in srgb, white 55%, transparent);
}
.template-one-page__colour {
  width: calc(var(--spacing) * 3);
  height: calc(var(--spacing) * 3);
  border: 1px solid rgb(255 255 255 / 35%);
  border-radius: 50%;
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
.template-one-page h1 {
  margin: 0;
  font-size: clamp(var(--text-5xl), 10vw, var(--text-9xl));
  letter-spacing: -0.07em;
  line-height: 0.9;
}
@media (min-width: 40.0625rem) {
  .template-one-page__preview-toolbar {
    grid-template-columns: 1fr auto 1fr;
    gap: calc(var(--spacing) * 4);
    padding-inline: clamp(calc(var(--spacing) * 4), 3vw, calc(var(--spacing) * 12));
  }
  .template-one-page__preview-toolbar > span {
    justify-self: auto;
  }
  .template-one-page__preview-toolbar > div {
    grid-column: auto;
    justify-content: flex-end;
    padding-bottom: 0;
  }
  .template-one-page__level-one {
    margin-inline: clamp(calc(var(--spacing) * 4), 3vw, calc(var(--spacing) * 12));
    flex-wrap: wrap;
    gap: calc(var(--spacing) * 3) calc(var(--spacing) * 6);
    overflow: visible;
  }
  .template-one-page__level-one dl {
    flex: 1;
    flex-wrap: wrap;
  }
  .template-one-page__level-one small {
    display: inline;
  }
}
</style>
  flex: 0 0 auto;
