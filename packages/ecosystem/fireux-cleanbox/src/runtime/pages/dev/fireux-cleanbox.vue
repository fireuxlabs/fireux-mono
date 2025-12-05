<template>
  <UPage>
    <UPageHeader
      title="Cleanbox Ecosystem"
      description="Ops-facing inspection tools for workforce scheduling and job postings."
    />

    <UPageBody class="space-y-6">
      <UCard>
        <template #header>
          <div class="flex flex-col gap-1">
            <h2 class="text-base font-semibold">Runtime snapshot</h2>
            <p class="text-sm text-gray-500">
              Live FireUX config for the active Cleanbox runtime.
            </p>
          </div>
        </template>
        <dl class="grid gap-4 sm:grid-cols-2 text-sm">
          <div>
            <dt class="text-gray-500">Ecosystem</dt>
            <dd class="font-medium">{{ cfg.ecosystem }}</dd>
          </div>
          <div>
            <dt class="text-gray-500">Role</dt>
            <dd class="font-medium capitalize">{{ cfg.role }}</dd>
          </div>
          <div>
            <dt class="text-gray-500">App ID</dt>
            <dd class="font-mono">{{ cfg.appId || 'not set' }}</dd>
          </div>
          <div>
            <dt class="text-gray-500">Modules</dt>
            <dd class="font-mono">
              {{ cfg.modules.length ? cfg.modules.join(', ') : 'none' }}
            </dd>
          </div>
        </dl>
      </UCard>

      <UCard>
        <template #header>
          <div class="flex items-center justify-between gap-3">
            <div class="flex flex-col">
              <h2 class="text-base font-semibold">Job collections</h2>
              <p class="text-sm text-gray-500">
                Mirrors fireux-jobs data using the same composables as runtime.
              </p>
            </div>
            <UBadge variant="soft">{{ totalJobs }} total</UBadge>
          </div>
        </template>

        <section class="grid gap-4 sm:grid-cols-3">
          <div class="rounded-lg border border-gray-200 p-3">
            <p class="text-xs text-gray-500 uppercase tracking-wide">
              Tenant scope
            </p>
            <p class="text-2xl font-semibold">{{ tenantTotal }}</p>
            <p class="text-xs text-gray-500">{{ cfg.appId || 'no appId' }}</p>
          </div>
          <div class="rounded-lg border border-gray-200 p-3">
            <p class="text-xs text-gray-500 uppercase tracking-wide">
              Global jobs
            </p>
            <p class="text-2xl font-semibold">{{ totalJobs }}</p>
            <p class="text-xs text-gray-500">Across /jobs</p>
          </div>
          <div class="rounded-lg border border-gray-200 p-3">
            <p class="text-xs text-gray-500 uppercase tracking-wide">Status</p>
            <p class="text-2xl font-semibold">
              {{ pending ? 'Loading…' : 'Ready' }}
            </p>
            <p class="text-xs text-gray-500">firestore stream</p>
          </div>
        </section>

        <div v-if="sampleJobs.length" class="grid gap-3 md:grid-cols-2">
          <UCard v-for="job in sampleJobs" :key="job.id">
            <template #header>
              <div class="flex items-center justify-between gap-2">
                <h3 class="font-semibold">{{ job.title || 'Untitled job' }}</h3>
                <UBadge size="xs" variant="soft">
                  {{ job.status || 'draft' }}
                </UBadge>
              </div>
              <p class="text-xs text-gray-500">{{ job.id }}</p>
            </template>
            <p class="text-sm text-gray-600 line-clamp-3">
              {{ job.description || 'No description yet.' }}
            </p>
          </UCard>
        </div>
        <p v-else class="text-sm text-gray-500">
          No jobs found for this runtime. Seed /jobs to populate the view.
        </p>

        <DevJsonPanel
          v-if="jobJson"
          title="Job stream"
          :data="jobJson"
          :default-open="false"
        />
      </UCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/core/config/FireUXConfig.ts'
import { useJobCollection } from 'fireux-jobs/runtime/composables/firestore/jobs/main/useJobCollection.ts'

definePageMeta({
  layout: 'dev',
  alias: ['/dev/fireux-cleanbox'],
  nav: {
    key: 'dev-cleanbox-ecosystem',
    label: 'Cleanbox',
    icon: 'i-lucide-broom',
    desktop: true,
    group: 'cleanbox',
    layouts: ['dev'],
  },
})

const cfg = useFireUXConfig()
const { jobs, tenantJobs, pending } = useJobCollection()

const totalJobs = computed(() => jobs.value?.length ?? 0)
const tenantTotal = computed(() => tenantJobs.value?.length ?? 0)
const sampleJobs = computed(() => (tenantJobs.value ?? []).slice(0, 4))
const jobJson = computed(() =>
  tenantJobs.value?.length ? tenantJobs.value : null
)
</script>
