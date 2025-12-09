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
              <h2 class="text-base font-semibold">Jobs developer tools</h2>
              <p class="text-sm text-gray-500">
                Use the jobs module dev page for streams and collections.
              </p>
            </div>
            <UButton
              size="sm"
              to="/dev/fireux-jobs"
              icon="i-lucide-arrow-up-right"
            >
              Open jobs dev
            </UButton>
          </div>
        </template>
        <p class="text-sm text-gray-600">
          Cleanbox dev view is now ecosystem-only. Job data inspection lives
          under the fireux-jobs dev page.
        </p>
      </UCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig.ts'

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
</script>
