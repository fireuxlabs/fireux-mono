<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription">
      <template #ctas>
        <UButton
          size="xs"
          variant="ghost"
          icon="i-lucide-arrow-left"
          :to="dashboardBase"
        >
          Back to dashboard
        </UButton>
        <UButton size="xs" variant="soft" color="neutral" :to="kitchenTo">
          Kitchen profile
        </UButton>
      </template>
    </UPageHeader>

    <UPageBody class="pagebody">
      <UCard>
        <template #header>
          <div class="text-sm font-semibold">Costs</div>
        </template>
        <p class="text-sm text-dimmed">Labour and ingredient costs will live here.</p>
      </UCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useRoute } from '#imports'
import { computed } from 'vue'

definePageMeta({
  layout: 'default',
  title: 'Kitchen Costs',
  description: 'Labour and ingredient costs.',
  head: { title: 'Kitchen Costs' },
})

const route = useRoute()
const raw = route.params.id
const docId = computed(() => (Array.isArray(raw) ? String(raw[0] ?? '') : String(raw ?? '')))

const dashboardBase = computed(() =>
  docId.value ? `/kitchens/dashboard/${encodeURIComponent(docId.value)}` : '/kitchens'
)
const kitchenTo = computed(() =>
  docId.value ? `/kitchens/${encodeURIComponent(docId.value)}` : '/kitchens'
)

const pageTitle = computed(() => 'Costs')
const pageDescription = computed(() => 'Labour and ingredient costs.')
</script>
