<template>
  <TemplateOneSceneOne
    v-if="isTemplateOne"
    :name="kitchen.name"
    :wordmark-src="wordmarkSrc"
    :place-primary-color="kitchen.rootProps.placePrimaryColor"
    :present="kitchen.appProps!.sceneOne.present"
    :identity-alignment="kitchen.appProps!.sceneOne.identityAlignment"
    :tagline="kitchen.appProps!.sceneOne.tagline"
    :palette="palette"
    :typography="kitchen.appProps!.typography"
    :flagship-dish="flagship?.dish || null"
    :requirements="requirements"
  />

  <UPage v-else>
    <UContainer class="py-12 sm:py-16">
      <UPageHeader
        :title="presentation.name"
        :description="presentation.summary"
        :links="[{ label: 'Back to templates', to: `/templates?kitchen=${kitchen.id}`, icon: 'i-lucide-arrow-left' }]"
      />
      <UPageBody>
        <TemplatesKitchenPalette :kitchen="kitchen" />
        <TemplatesKitchenTypography :kitchen="kitchen" />
      </UPageBody>
    </UContainer>
  </UPage>
</template>

<script setup lang="ts">
import { createError } from 'h3'
import TemplateOneSceneOne from 'fireux-misebox/runtime/TemplateOneSceneOne.vue'
import {
  findLandingTemplate,
  findLandingTemplateBrand,
  isLandingTemplateBrandId,
} from 'fireux-misebox/runtime/template-one-fixtures'
import { resolveAppPalette } from 'fireux-core/runtime/utils/brand-palette'
import type { AppPalette } from 'fireux-core/types/theme'
import type { KitchenFlagshipDishResult } from 'fireux-kitchens/runtime/server/dish/flagship-projection'
import type { TemplateOneKitchenSpecimen } from 'fireux-misebox/runtime/template-one'
import { miseboxDemoMediaUrl } from 'fireux-demo/runtime/media/misebox'
import { useSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'

const route = useRoute()
const presentation = findLandingTemplate(String(route.params.slug || ''))
if (!presentation)
  throw createError({ statusCode: 404, statusMessage: 'Presentation not found' })

const kitchenId = String(route.query.kitchen || '')
const kitchen: TemplateOneKitchenSpecimen = isLandingTemplateBrandId(kitchenId)
  ? findLandingTemplateBrand(kitchenId)!
  : findLandingTemplateBrand('seehotel-bonigen')!
const rank = { root: 0, console: 1, app: 2 } as const
if (rank[kitchen.tier] < rank[presentation.minimumTier])
  throw createError({ statusCode: 404, statusMessage: 'Presentation unavailable for this Kitchen' })

const isTemplateOne = presentation.slug === 'template-one' && Boolean(kitchen.appProps)
const { data: flagship } = await useAsyncData(
  `template-flagship-${kitchen.id}`,
  () => isTemplateOne
    ? $fetch<KitchenFlagshipDishResult>(
        `/api/kitchens/${kitchen.appProps!.kitchenId}/flagship-dish`,
        { query: { appId: kitchen.appProps!.appId } }
      )
    : null
)
const palette = computed<AppPalette>(() => {
  if (!kitchen.consoleProps || !kitchen.appProps)
    throw createError({ statusCode: 404, statusMessage: 'App presentation unavailable' })
  return resolveAppPalette(kitchen.consoleProps.palette, kitchen.appProps.palette)!
})
const wordmarkSrc = computed(() => {
  const source = kitchen.rootProps.wordmarkSrc
  return source.startsWith('demo:') ? miseboxDemoMediaUrl(source.slice(5)) : source
})
const requirements = computed(() => ({
  wordmark: Boolean(wordmarkSrc.value),
  palette: Boolean(palette.value),
  typography: Boolean(
    kitchen.appProps?.typography.display_family &&
    kitchen.appProps?.typography.body_family
  ),
  flagshipDish: flagship.value?.ready === true,
  pattern: 'unapproved' as const,
}))

definePageMeta({ layout: 'landing', name: 'MiseboxTemplateDetailPage' })
useSeo({
  title: `${presentation.name} · ${kitchen.name} · Misebox`,
  description: presentation.summary,
  path: `/templates/${presentation.slug}`,
  image: '/img/app/cover.png',
})
</script>
