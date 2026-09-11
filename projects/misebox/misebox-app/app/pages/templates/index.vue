<template>
  <main class="catalogue">
    <UContainer>
      <header>
        <p>Templates and theming</p>
        <h1>Select a Kitchen. Compare templates.</h1>
        <span
          >Kitchen supplies the identity and assets. Each template decides how
          to present them.</span
        >
      </header>

      <section aria-labelledby="kitchen-title">
        <div>
          <small>Step 1</small>
          <h2 id="kitchen-title">Kitchen</h2>
        </div>
        <nav aria-label="Select Kitchen">
          <NuxtLink
            v-for="kitchen in kitchens"
            :key="kitchen.id"
            replace
            :to="{ query: { kitchen: kitchen.id } }"
            :aria-current="
              kitchen.id === selectedKitchen.id ? 'true' : undefined
            "
          >
            <strong>{{ kitchen.name }}</strong>
            <small>{{ kitchen.tier }}{{ kitchen.demo ? ' · Demo' : '' }}</small>
          </NuxtLink>
        </nav>
      </section>

      <TemplatesKitchenPalette :kitchen="selectedKitchen" />
      <TemplatesKitchenTypography :kitchen="selectedKitchen" />

      <section aria-labelledby="readiness-title">
        <div>
          <small>Kitchen readiness</small>
          <h2 id="readiness-title">
            {{ readiness.ready ? 'Kitchen ready' : 'Kitchen not ready' }}
          </h2>
        </div>
        <ul class="catalogue__readiness">
          <li
            v-for="item in readiness.items"
            :key="item.label"
            :data-ready="item.ready"
          >
            <UIcon
              :name="item.ready ? 'i-lucide-circle-check' : 'i-lucide-circle-x'"
              aria-hidden="true"
            />
            <span>{{ item.label }}</span>
          </li>
        </ul>
      </section>

      <section aria-labelledby="template-title">
        <div>
          <small>Step 2</small>
          <h2 id="template-title">Template</h2>
        </div>
        <div class="catalogue__templates">
          <article v-for="item in templates" :key="item.slug">
            <small>{{ item.status }}</small>
            <h3>{{ item.name }}</h3>
            <p>{{ item.summary }}</p>
            <small>{{ requirementLabel(item) }}</small>
            <UButton
              :to="
                isAvailable(item)
                  ? {
                      path: `/templates/${item.slug}`,
                      query: { kitchen: selectedKitchen.id },
                    }
                  : undefined
              "
              :disabled="!isAvailable(item)"
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
import { useLiveAsyncData } from 'fireux-core/runtime/composables/fireux/firestore/useLiveAsyncData'

import { useSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import {
  findLandingTemplateBrand,
  isLandingTemplateBrandId,
  landingTemplateBrands,
  landingTemplates,
} from 'fireux-misebox/runtime/content/template-one-fixtures'
import type { TemplateOneKitchenSpecimen } from 'fireux-misebox/runtime/models/template-one'
import type { KitchenFlagshipDishResult } from 'fireux-kitchens/runtime/kitchen/server/operations/dishes/flagship-projection'

const route = useRoute()
const kitchens = landingTemplateBrands
const templates = landingTemplates
const tierRank = { root: 0, workspace: 1, app: 2 } as const
const selectedKitchen = computed<TemplateOneKitchenSpecimen>(() => {
  const id = String(route.query.kitchen || '')
  return isLandingTemplateBrandId(id)
    ? findLandingTemplateBrand(id)!
    : kitchens[0]
})
const flagshipKey = computed(
  () => `template-kitchen-readiness-${selectedKitchen.value.id}`
)
const { data: flagship } = await useLiveAsyncData(
  flagshipKey,
  (liveFetch) =>
    selectedKitchen.value.appProps && selectedKitchen.value.id !== 'deanos'
      ? liveFetch<KitchenFlagshipDishResult>(
          `/api/kitchens/${selectedKitchen.value.appProps.kitchenId}/flagship-dish`,
          { query: { appId: selectedKitchen.value.appProps.appId } }
        ).catch(() => null)
      : Promise.resolve(null),
  { watch: [selectedKitchen] }
)
const requiredAssets = [
  'logo',
  'wordmarkLight',
  'wordmarkDark',
  'cover',
  'thumbnail',
] as const
const readiness = computed(() => {
  const kitchen = selectedKitchen.value
  const pageStyle = kitchen.workspaceProps?.pageStyle
  const displayFont =
    kitchen.appProps?.typography.display_family ||
    pageStyle?.title_font_family ||
    (pageStyle?.title_font_source === 'system' ? 'system' : '')
  const bodyFont =
    kitchen.appProps?.typography.body_family ||
    pageStyle?.font_family ||
    (pageStyle?.font_source === 'system' ? 'system' : '')
  const items = [
    { label: 'Kitchen name', ready: Boolean(kitchen.name.trim()) },
    {
      label: 'Kitchen tagline',
      ready: Boolean(kitchen.rootProps.tagline.trim()),
    },
    {
      label: 'Effective palette',
      ready: Boolean(
        kitchen.appProps?.palette || kitchen.workspaceProps?.palette
      ),
    },
    { label: 'Display font', ready: Boolean(displayFont) },
    { label: 'Body font', ready: Boolean(bodyFont) },
    ...requiredAssets.map((role) => ({
      label:
        role === 'wordmarkLight'
          ? 'Light-surface wordmark'
          : role === 'wordmarkDark'
            ? 'Dark-surface wordmark'
            : role[0].toUpperCase() + role.slice(1),
      ready: Boolean(kitchen.assetSources[role]),
    })),
    {
      label: 'Exactly one flagship Dish',
      ready:
        kitchen.id === 'deanos' ||
        flagship.value?.contentReadiness.uniqueFlagship === true,
    },
    {
      label: 'Flagship Dish image',
      ready: kitchen.id === 'deanos' || flagship.value?.ready === true,
    },
  ]
  return { ready: items.every((item) => item.ready), items }
})
type TemplateCatalogueItem = (typeof templates)[number]
const isAvailable = (item: TemplateCatalogueItem) =>
  item.slug === 'template-one'
    ? readiness.value.ready
    : tierRank[selectedKitchen.value.tier] >= tierRank[item.minimumTier]
const requirementLabel = (item: TemplateCatalogueItem) =>
  item.slug === 'template-one'
    ? 'Template-ready Kitchen'
    : item.minimumTier === 'root'
      ? 'Root and above'
      : 'Workspace and App'

definePageMeta({ layout: 'landing', name: 'MiseboxTemplatesIndexPage' })
useSeo({
  title: 'Restaurant Templates · Misebox',
  description:
    'Select a Kitchen and compare reusable restaurant templates using the same identity inputs.',
  path: '/templates',
  image: '/img/app/cover.png',
})
</script>

<style scoped>
.catalogue {
  min-height: 100svh;
  padding: clamp(calc(var(--spacing) * 24), 12vw, calc(var(--spacing) * 40)) 0;
  background: var(--ui-bg);
}
.catalogue :deep(.container),
header,
section {
  display: grid;
  gap: calc(var(--spacing) * 6);
}
header {
  max-width: 56rem;
}
header > p,
section > div small,
article > small {
  color: var(--ui-primary);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-extrabold);
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
}
h1 {
  max-width: 14ch;
  margin: 0;
  font-size: clamp(var(--text-5xl), 8vw, var(--text-8xl));
  letter-spacing: -0.065em;
  line-height: 0.94;
}
header > span,
article p {
  color: var(--ui-text-muted);
}
section {
  margin-top: calc(var(--spacing) * 12);
  padding-top: calc(var(--spacing) * 8);
  border-top: 1px solid var(--ui-border);
}
section h2,
article h3 {
  margin: calc(var(--spacing) * 1) 0 0;
}
nav,
.catalogue__templates {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr));
  gap: calc(var(--spacing) * 3);
}
nav a,
article {
  display: grid;
  gap: calc(var(--spacing) * 2);
  padding: calc(var(--spacing) * 4);
  color: inherit;
  background: var(--ui-bg-muted);
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius);
  text-decoration: none;
}
nav a[aria-current='true'] {
  border-color: var(--ui-primary);
  box-shadow: inset 0 0 0 1px var(--ui-primary);
}
nav small {
  color: var(--ui-text-muted);
  text-transform: capitalize;
}
article {
  align-content: start;
  min-height: calc(var(--spacing) * 60);
  padding: calc(var(--spacing) * 6);
}
article :deep(a) {
  align-self: end;
  width: fit-content;
  margin-top: auto;
}
.catalogue__readiness {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
  gap: calc(var(--spacing) * 2);
  padding: 0;
  list-style: none;
}
.catalogue__readiness li {
  display: flex;
  gap: calc(var(--spacing) * 2);
  align-items: center;
  color: var(--ui-error);
}
.catalogue__readiness li[data-ready='true'] {
  color: var(--ui-success);
}
.catalogue__readiness svg {
  flex: 0 0 auto;
}
</style>
