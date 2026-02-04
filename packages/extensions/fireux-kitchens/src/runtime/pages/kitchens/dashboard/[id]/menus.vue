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
          <div class="text-sm font-semibold">Menus</div>
        </template>
        <p class="text-sm text-dimmed">Menus and dishes will live here.</p>
      </UCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useRoute } from '#imports'
import { computed } from 'vue'

definePageMeta({
  layout: 'default',
  title: 'Kitchen Menus',
  description: 'Menus and dishes overview.',
  head: { title: 'Kitchen Menus' },
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

const pageTitle = computed(() => 'Menus')
const pageDescription = computed(() => 'Live and paused dishes.')
</script>
