<template>
  <ClientOnly>
    <UPage>
      <UPageHeader :title="pageTitle" :description="pageDescription">
        <template #ctas>
          <UButton
            size="xs"
            variant="ghost"
            icon="i-lucide-arrow-left"
            to="/kitchens"
          >
            Back
          </UButton>

          <UButton
            size="xs"
            color="primary"
            icon="i-lucide-pencil"
            :disabled="!docId"
            :to="editTo"
          >
            Edit
          </UButton>
        </template>
      </UPageHeader>

      <UPageBody class="pagebody">
        <div v-if="loading" class="py-10 text-sm opacity-70">
          Loading kitchen…
        </div>

        <div v-else-if="!kitchen" class="space-y-2">
          <h1 class="text-lg font-semibold">Kitchen Not Found</h1>
          <p>The kitchen you’re looking for doesn’t exist.</p>
          <NuxtLink to="/kitchens" class="text-primary hover:underline">
            ← Back
          </NuxtLink>
        </div>

        <div v-else class="space-y-4">
          <UCard>
            <template #header>
              <div class="flex items-center justify-between gap-3">
                <div class="text-sm font-semibold">Overview</div>
                <UBadge size="xs" variant="soft" color="primary">
                  {{ kitchen.id }}
                </UBadge>
              </div>
            </template>

            <div class="space-y-2 text-sm">
              <div>
                <div class="text-xs uppercase tracking-wide text-gray-400">
                  Name
                </div>
                <div class="font-medium">
                  {{ kitchen.name || '—' }}
                </div>
              </div>

              <div>
                <div class="text-xs uppercase tracking-wide text-gray-400">
                  Website
                </div>
                <div class="font-medium">
                  {{ kitchen.website || '—' }}
                </div>
              </div>
            </div>
          </UCard>

          <UCard>
            <template #header>
              <div class="text-sm font-semibold">Raw</div>
            </template>

            <pre class="max-h-[420px] overflow-auto text-xs">{{ json }}</pre>
          </UCard>
        </div>
      </UPageBody>
    </UPage>

    <template #fallback>
      <div class="py-10 text-sm opacity-70">Loading kitchen…</div>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
import { useHead, useRoute } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { computed } from 'vue'
import { useKitchenFetch } from '../../composables/fireux/firestore/objects/kitchen/fetch/useKitchenFetch'
import type { Kitchen } from '../../models/objects/kitchen.model'

definePageMeta({
  layout: 'default',
  title: 'Kitchen',
  description: 'View a saved kitchen.',
  head: { title: 'Kitchen' },
})

const { appName } = useFireUXConfig()

const route = useRoute()
const raw = route.params.id
const docId = Array.isArray(raw) ? String(raw[0] ?? '') : String(raw ?? '')

const editTo = computed(() =>
  docId ? `/kitchens/edit/${encodeURIComponent(docId)}` : '/kitchens'
)

const { kitchen: fetchKitchen } = useKitchenFetch()
const rawDoc = docId ? await fetchKitchen(docId) : null

const kitchen = computed<Kitchen | null>(
  () => (rawDoc as any)?.value ?? rawDoc ?? null
)

const loading = computed(() => !rawDoc && !!docId)

const pageTitle = computed(() => kitchen.value?.name || 'Kitchen')
const pageDescription = computed(
  () => kitchen.value?.website || 'Saved kitchen details.'
)

useHead({
  title: computed(() => `${appName} | ${pageTitle.value}`),
})

const json = computed(() => JSON.stringify(kitchen.value, null, 2))
</script>
