<template>
  <TemplateOnePage v-if="projection" :projection="projection" />

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
import TemplateOnePage from 'fireux-misebox/runtime/components/TemplateOne/Page.vue'
import {
  createTemplateOneFixtureProjection,
  findLandingTemplate,
  findLandingTemplateBrand,
  isLandingTemplateBrandId,
} from 'fireux-misebox/runtime/content/template-one-fixtures'
import { useTemplateOneProductDemo } from '~/composables/product-demo/useTemplateOneProductDemo'
import type { MenuDetailPayload } from 'fireux-kitchens/runtime/menu/models/menu-detail.model'
import type { KitchenFlagshipDishResult } from 'fireux-kitchens/runtime/kitchen/server/operations/dishes/flagship-projection'
import type { TemplateOneKitchenSpecimen } from 'fireux-misebox/runtime/models/template-one'
import { miseboxDemoMediaUrl } from 'fireux-demo/runtime/utils/media/misebox'
import { useSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'

const route = useRoute()
const presentation = findLandingTemplate(String(route.params.slug || ''))
if (!presentation)
  throw createError({ statusCode: 404, statusMessage: 'Presentation not found' })

const kitchenId = String(route.query.kitchen || '')
const kitchen: TemplateOneKitchenSpecimen = isLandingTemplateBrandId(kitchenId)
  ? findLandingTemplateBrand(kitchenId)!
  : findLandingTemplateBrand('seehotel-bonigen')!
const rank = { root: 0, workspace: 1, app: 2 } as const
if (rank[kitchen.tier] < rank[presentation.minimumTier])
  throw createError({ statusCode: 404, statusMessage: 'Presentation unavailable for this Kitchen' })

const isTemplateOne = presentation.slug === 'template-one' && Boolean(kitchen.appProps)
const deanosData = isTemplateOne && kitchen.id === 'deanos'
  ? await useTemplateOneProductDemo()
  : null
const [{ data: flagship }, { data: menuResult }] = await Promise.all([useAsyncData(
  `template-flagship-${kitchen.id}`,
  () => isTemplateOne && kitchen.id !== 'deanos'
    ? $fetch<KitchenFlagshipDishResult>(
        `/api/kitchens/${kitchen.appProps!.kitchenId}/flagship-dish`,
        { query: { appId: kitchen.appProps!.appId } }
      )
    : null
), useAsyncData(
  `template-menu-${kitchen.id}`,
  () => isTemplateOne && kitchen.id !== 'deanos'
    ? $fetch<MenuDetailPayload>('/api/menus/friiites')
    : null
)])
const storageUrl = (path: string) =>
  `https://firebasestorage.googleapis.com/v0/b/misebox-78f9c.appspot.com/o/${encodeURIComponent(`apps/friiites/img/app/${path}`)}?alt=media`
const projection = computed(() => {
  if (!isTemplateOne) return null
  if (kitchen.id === 'deanos') {
    return createTemplateOneFixtureProjection({
      kitchen,
      menu: deanosData!.menu,
      flagshipDish: deanosData!.flagshipDish,
      media: path => miseboxDemoMediaUrl(`kitchens/deanos/${path}`),
      wordmarkSrc: miseboxDemoMediaUrl('kitchens/deanos/logo.png'),
    })
  }
  if (menuResult.value?.kind !== 'manifest') return null
  return createTemplateOneFixtureProjection({
    kitchen,
    menu: {
      menu: menuResult.value.manifest.content,
      specials: menuResult.value.manifest.specials,
      menuHref: '/menus/friiites',
      menuActionLabel: 'Browse menu',
    },
    flagshipDish: flagship.value?.dish || null,
    media: storageUrl,
    wordmarkSrc: kitchen.rootProps.wordmarkSrc,
  })
})

definePageMeta({ layout: false, name: 'MiseboxTemplateDetailPage' })
useSeo({
  title: `${presentation.name} · ${kitchen.name} · Misebox`,
  description: presentation.summary,
  path: `/templates/${presentation.slug}`,
  image: '/img/app/cover.png',
})
</script>
