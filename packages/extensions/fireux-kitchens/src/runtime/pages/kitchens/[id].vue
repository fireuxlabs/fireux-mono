<template>
  <UPage>
    <UPageHeader title="Kitchen" :description="docId" />

    <UPageBody class="pagebody">
      <pre>{{ kitchen }}</pre>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useRoute } from '#imports'
import type { Kitchen } from 'fireux-kitchens/runtime/models/kitchen.model'
import { computed } from 'vue'
import { useKitchenFetch } from '../../composables/fireux/firestore/kitchen/fetch/useKitchenFetch'

definePageMeta({
  layout: 'default',
  title: 'Kitchen',
  description: 'View a saved kitchen.',
  head: { title: 'Kitchen' },
})

const route = useRoute()
const docId = String(route.params.id || '')

const { kitchen: fetchKitchen } = useKitchenFetch()
const rawDoc = docId ? fetchKitchen(docId) : null

const kitchen = computed<Kitchen | null>(() => rawDoc?.value ?? null)

</script>
