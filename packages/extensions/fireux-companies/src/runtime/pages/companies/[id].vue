<template>
  <ClientOnly>
    <UPage>
      <UPageHeader :title="pageTitle" :description="pageDescription">
        <template #ctas>
          <UButton
            size="xs"
            variant="ghost"
            icon="i-lucide-arrow-left"
            to="/companies"
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
          Loading company…
        </div>

        <div v-else-if="!company" class="space-y-2">
          <h1 class="text-lg font-semibold">Company Not Found</h1>
          <p>The company you’re looking for doesn’t exist.</p>
          <NuxtLink to="/companies" class="text-primary hover:underline">
            ← Back
          </NuxtLink>
        </div>

        <div v-else class="space-y-4">
          <UCard>
            <template #header>
              <div class="flex items-center justify-between gap-3">
                <div class="text-sm font-semibold">Overview</div>
                <UBadge size="xs" variant="soft" color="primary">
                  {{ company.id }}
                </UBadge>
              </div>
            </template>

            <div class="space-y-2 text-sm">
              <div>
                <div class="text-xs uppercase tracking-wide text-gray-400">
                  Name
                </div>
                <div class="font-medium">
                  {{ company.name || '—' }}
                </div>
              </div>

              <div>
                <div class="text-xs uppercase tracking-wide text-gray-400">
                  Website
                </div>
                <div class="font-medium">
                  {{ company.website || '—' }}
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
      <div class="py-10 text-sm opacity-70">Loading company…</div>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
import { useHead, useRoute } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { computed } from 'vue'
import { useCompanyFetch } from '../../composables/fireux/firestore/objects/company/fetch/useCompanyFetch'
import type { Company } from '../../models/objects/company.model'

definePageMeta({
  layout: 'default',
  title: 'Company',
  description: 'View a saved company.',
  head: { title: 'Company' },
})

const { appName } = useFireUXConfig()

const route = useRoute()
const raw = route.params.id
const docId = Array.isArray(raw) ? String(raw[0] ?? '') : String(raw ?? '')

const editTo = computed(() =>
  docId ? `/companies/edit/${encodeURIComponent(docId)}` : '/companies'
)

const { company: fetchCompany } = useCompanyFetch()
const rawDoc = docId ? await fetchCompany(docId) : null

const company = computed<Company | null>(
  () => (rawDoc as any)?.value ?? rawDoc ?? null
)

const loading = computed(() => !rawDoc && !!docId)

const pageTitle = computed(() => company.value?.name || 'Company')
const pageDescription = computed(
  () => company.value?.website || 'Saved company details.'
)

useHead({
  title: computed(() => `${appName} | ${pageTitle.value}`),
})

const json = computed(() => JSON.stringify(company.value, null, 2))
</script>
