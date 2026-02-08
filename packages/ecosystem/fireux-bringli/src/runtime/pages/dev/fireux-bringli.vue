<template>
  <UPage>
    <UPageHeader
      title="Dev · Bringli"
      description="Bringli ecosystem overview for the active runtime."
    />

    <UPageBody class="pagebody space-y-6">
      <UCard>
        <template #header>
          <div class="flex flex-col gap-1">
            <h2 class="text-base font-semibold">Ecosystem status</h2>
            <p class="text-sm text-gray-500">
              Bringli is configured as a local-first producer marketplace ecosystem.
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
            <dd class="font-mono">{{ cfg.modules.length ? cfg.modules.join(', ') : 'none' }}</dd>
          </div>
        </dl>
      </UCard>

      <UCard>
        <template #header>
          <div class="flex flex-col gap-1">
            <h2 class="text-base font-semibold">Bringli defaults</h2>
            <p class="text-sm text-gray-500">
              Runtime defaults keep Drop and Places enabled unless overridden in app config.
            </p>
          </div>
        </template>

        <ul class="list-disc pl-5 space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li>Drop extension should own supplier and local delivery-facing profile flows.</li>
          <li>Places extension remains available for location and service-area workflows.</li>
          <li>Firebase keys in ecosystem config are placeholders until project provisioning is completed.</li>
        </ul>
      </UCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'

definePageMeta({
  layout: 'dev',
  nav: {
    key: 'dev-tenant-bringli',
    label: 'Bringli',
    icon: 'i-lucide-store',
    desktop: true,
    group: 'bringli',
    layouts: ['dev'],
  },
})

const cfg = useFireUXConfig()
</script>
