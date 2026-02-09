<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription">
      <template #ctas>
        <UButton
          size="xs"
          color="primary"
          icon="i-lucide-chef-hat"
          :to="kitchenDashboardTo"
        >
          Kitchen dashboard
        </UButton>
        <UButton
          size="xs"
          variant="ghost"
          icon="i-lucide-book-open"
          to="/kitchens/learn-more"
        >
          Learn more
        </UButton>
        <UButton
          size="xs"
          variant="soft"
          color="neutral"
          icon="i-lucide-carrot"
          to="/ingredients"
        >
          Ingredients
        </UButton>
        <UButton
          size="xs"
          color="primary"
          icon="i-lucide-users"
          to="/chefs"
        >
          Chef profiles
        </UButton>
      </template>
    </UPageHeader>

    <UPageBody class="pagebody">
      <UCard>
        <template #header>
          <div class="space-y-1">
            <h2 class="text-base font-semibold">My kitchens</h2>
            <p class="text-xs text-dimmed">Choose your runtime kitchen context and open the kitchen dashboard.</p>
          </div>
        </template>

        <div class="space-y-3">
          <template v-if="myKitchenSelection.length">
            <p class="text-sm text-dimmed">
              {{ claimedKitchenSummary }}
            </p>
            <div class="flex flex-wrap gap-2">
              <NuxtLink v-for="pill in myKitchenPills" :key="pill.id" :to="pill.to">
                <KitchenCardsPill v-bind="pill" />
              </NuxtLink>
            </div>
            <div v-if="myTestKitchenPills.length" class="space-y-2">
              <p class="text-xs text-dimmed">Test kitchens</p>
              <div class="flex flex-wrap gap-2">
                <NuxtLink
                  v-for="pill in myTestKitchenPills"
                  :key="pill.id"
                  :to="pill.to"
                >
                  <KitchenCardsPill v-bind="pill" />
                </NuxtLink>
              </div>
            </div>
            <div
              v-if="myKitchenSelection.length > 1 && runtimeKitchen"
              class="space-y-1 rounded-md border border-primary/20 bg-primary/5 p-2"
            >
              <p class="text-xs text-dimmed">
                Default runtime kitchen
              </p>
              <div class="flex flex-wrap items-center gap-2">
                <UBadge variant="soft" color="primary">
                  {{ runtimeKitchen.name || runtimeKitchen.id }}
                </UBadge>
                <span class="text-xs text-dimmed">{{ runtimeKitchenSource }}</span>
              </div>
            </div>
            <div>
              <UButton
                size="xs"
                color="primary"
                icon="i-lucide-chef-hat"
                :to="kitchenDashboardTo"
              >
                Open kitchen dashboard
              </UButton>
            </div>
          </template>

          <template v-else-if="runtimeKitchen">
            <p class="text-sm text-dimmed">
              {{ runtimeFallbackSummary }}
            </p>
            <NuxtLink v-if="runtimeKitchenPill" :to="runtimeKitchenPill.to">
              <KitchenCardsPill v-bind="runtimeKitchenPill" />
            </NuxtLink>
            <div>
              <UButton
                size="xs"
                color="primary"
                icon="i-lucide-chef-hat"
                :to="kitchenDashboardTo"
              >
                Open kitchen dashboard
              </UButton>
            </div>
          </template>

          <p v-else class="text-sm text-dimmed">
            No kitchens yet. Create your first kitchen below.
          </p>
        </div>
      </UCard>

      <KitchenCTA />
      <KitchenCollectionManager :collection="collection" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import { computed } from 'vue'
import { useKitchenDashboardSelection } from '../../composables/fireux/app/useKitchenDashboardSelection'
import { useKitchenFetch } from '../../composables/fireux/firestore/objects/kitchen/fetch/useKitchenFetch'
import { useKitchenInterface } from '../../composables/fireux/firestore/objects/kitchen/utils/view/useKitchenInterface'
import type { Kitchen } from '../../models/objects/kitchen.model'

definePageMeta({
  nav: {
    key: 'kitchens',
    label: 'Kitchens',
    icon: 'i-lucide-chef-hat',
    order: 55,
    desktop: true,
    mobile: true,
    layouts: ['default'],
  },
  title: 'Kitchens',
  description: 'Runtime kitchen selection and dashboard launch.',
  layout: 'default',
  name: 'KitchensIndexPage',
})

const pageTitle = 'Kitchens'
const pageDescription =
  'Select your runtime kitchen context and open the kitchen dashboard.'

const { appName } = useFireUXConfig()
useHead({ title: `${appName} | ${pageTitle}` })

const { user } = useUser()
const { kitchens } = useKitchenFetch()
const { runtimeKitchenId, myKitchenIds, hasTestKitchen, configuredKitchenId } =
  useKitchenDashboardSelection()
const testKitchenId = computed(() => String(user.value?.id || '').trim())

const collection = computed(() => kitchens.value ?? [])
const { pill: makePill } = useKitchenInterface()

const kitchenById = computed(() => {
  const map = new Map<string, Kitchen>()
  for (const kitchen of collection.value) {
    if (!kitchen?.id) continue
    map.set(String(kitchen.id), kitchen)
  }
  return map
})

const virtualTestKitchen = (id: string): Kitchen => ({
  id,
  name: 'Test Kitchen',
  short_name: 'Test Kitchen',
  short_address: 'Test Kitchen',
  formatted_address: 'Test Kitchen',
  image_url: '',
})

const myKitchens = computed(() =>
  myKitchenIds.value
    .map((id) => kitchenById.value.get(id))
    .filter(Boolean) as Kitchen[]
)
const myTestKitchens = computed(() =>
  hasTestKitchen.value && testKitchenId.value
    ? [kitchenById.value.get(testKitchenId.value) ?? virtualTestKitchen(testKitchenId.value)]
    : []
)
const myKitchenSelection = computed(() => [...myKitchens.value, ...myTestKitchens.value])

const kitchenSelectionTo = (id: string) =>
  `/kitchens?kitchenId=${encodeURIComponent(id)}`

const myKitchenPills = computed(() =>
  myKitchens.value
    .map((kitchen) => {
      const pill = makePill(kitchen)
      if (!pill) return null
      return {
        ...pill,
        to: kitchenSelectionTo(pill.id),
      }
    })
    .filter((pill): pill is NonNullable<typeof pill> => Boolean(pill))
)
const myTestKitchenPills = computed(() =>
  myTestKitchens.value
    .map((kitchen) => {
      const pill = makePill(kitchen)
      if (!pill) return null
      return {
        ...pill,
        to: kitchenSelectionTo(pill.id),
      }
    })
    .filter((pill): pill is NonNullable<typeof pill> => Boolean(pill))
)

const hiddenTestKitchenCount = computed(() => (hasTestKitchen.value ? 1 : 0))
const totalClaimedKitchenCount = computed(() => myKitchenSelection.value.length)

const claimedKitchenSummary = computed(() => {
  const total = totalClaimedKitchenCount.value
  const hidden = hiddenTestKitchenCount.value

  const base =
    total === 1 ? 'You have 1 claimed kitchen.' : `You have ${total} claimed kitchens.`
  if (!hidden) return base

  const hiddenLabel =
    hidden === 1
      ? '1 test kitchen is hidden from the main collection list.'
      : `${hidden} test kitchens are hidden from the main collection list.`
  return `${base} ${hiddenLabel}`
})

const runtimeKitchen = computed(() => {
  const id = String(runtimeKitchenId.value || '').trim()
  if (!id) return null
  const resolved = kitchenById.value.get(id)
  if (resolved) return resolved
  if (hasTestKitchen.value && id === testKitchenId.value) return virtualTestKitchen(id)
  return null
})
const runtimeKitchenPill = computed(() => {
  const pill = makePill(runtimeKitchen.value)
  if (!pill) return null
  return {
    ...pill,
    to: kitchenSelectionTo(pill.id),
  }
})
const runtimeFallbackSummary = computed(() => {
  const hidden = hiddenTestKitchenCount.value
  if (hidden > 0) {
    return hidden === 1
      ? 'You have 1 claimed test kitchen (hidden from lists). Using runtime fallback kitchen:'
      : `You have ${hidden} claimed test kitchens (hidden from lists). Using runtime fallback kitchen:`
  }
  return 'No claimed kitchens found for this user. Using runtime fallback kitchen:'
})

const runtimeKitchenSource = computed(() => {
  const configured = String(configuredKitchenId.value || '').trim()
  if (configured && configured === runtimeKitchenId.value) {
    return 'Using configured default'
  }
  if (myKitchens.value.length > 1) {
    return 'Using first claimed kitchen'
  }
  return 'Using resolved kitchen'
})

const kitchenDashboardTo = computed(() =>
  runtimeKitchenId.value
    ? {
        path: '/dashboard/kitchen',
        query: { kitchenId: runtimeKitchenId.value },
      }
    : '/dashboard/kitchen'
)
</script>
