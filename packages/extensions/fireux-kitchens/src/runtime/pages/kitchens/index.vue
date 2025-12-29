<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription" />
    <UPageBody class="pagebody">
      <ul v-if="kitchens.length" class="space-y-2">
        <li
          v-for="(kitchen, index) in kitchens"
          :key="kitchenKey(kitchen, index)"
        >
          <p class="text-sm font-medium">{{ kitchenLabel(kitchen, index) }}</p>
        </li>
      </ul>

      <p v-else class="text-sm text-slate-500">No kitchens found.</p>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useKitchens } from '../../composables/fireux/firestore/objects/kitchen/useKitchens'

definePageMeta({
  layout: 'default',
  title: 'Kitchens',
  description: 'Saved kitchens.',
  nav: {
    key: 'kitchens',
    label: 'Kitchens',
    icon: 'i-lucide-chef-hat',
    order: 26,
    desktop: true,
    mobile: true,
    layouts: ['default'],
  },
  head: { title: 'Kitchens' },
})

const { appName } = useFireUXConfig()
useHead({ title: `${appName} | Kitchens` })

const { collection } = useKitchens<Record<string, any>>()
const kitchens = computed(() => collection.value ?? [])

const pageTitle = computed(() => 'Kitchens')
const pageDescription = computed(() => 'Saved kitchens.')

function kitchenKey(kitchen: Record<string, any>, index: number) {
  return kitchen?.id ?? kitchen?.place_id ?? kitchen?.slug ?? index
}

function kitchenLabel(kitchen: Record<string, any>, index: number) {
  return kitchen?.name ?? kitchen?.title ?? kitchen?.label ?? `Kitchen ${index + 1}`
}
</script>
