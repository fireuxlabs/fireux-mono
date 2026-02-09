<template>
  <UPage>
    <UPageHeader
      title="Dev · Misebox"
      description="Misebox ecosystem overview for the active runtime."
    />

    <UPageBody class="pagebody">
      <div class="space-y-4">
        <UCard>
          <div class="flex items-center justify-between gap-3">
            <div class="text-sm font-semibold">Ecosystem status</div>
            <UButton
              variant="ghost"
              size="xs"
              @click="toggleSection('status')"
            >
              {{ openSections.status ? 'Hide' : 'Show' }}
            </UButton>
          </div>
          <div v-show="openSections.status" class="mt-4">
            <UCard>
              <template #header>
                <div class="flex flex-col gap-1">
                  <h2 class="text-base font-semibold">Ecosystem status</h2>
                  <p class="text-sm text-gray-500">
                    Misebox remains the app ecosystem. Supplier domain is now provided by Drop extension.
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
          </div>
        </UCard>

        <UCard>
          <div class="flex items-center justify-between gap-3">
            <div class="text-sm font-semibold">Domain ownership</div>
            <UButton
              variant="ghost"
              size="xs"
              @click="toggleSection('ownership')"
            >
              {{ openSections.ownership ? 'Hide' : 'Show' }}
            </UButton>
          </div>
          <div v-show="openSections.ownership" class="mt-4">
            <UCard>
              <template #header>
                <div class="flex flex-col gap-1">
                  <h2 class="text-base font-semibold">Domain ownership</h2>
                  <p class="text-sm text-gray-500">
                    Canonical ownership after migration.
                  </p>
                </div>
              </template>

              <ul class="list-disc pl-5 space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li>Misebox ecosystem: app composition, ecosystem config, runtime identity.</li>
                <li>Drop extension: suppliers pages, models, composables, and UI components.</li>
                <li>Misebox ingredient create flow consumes Supplier APIs from Drop.</li>
              </ul>
            </UCard>
          </div>
        </UCard>
      </div>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig';
import { reactive } from 'vue';

definePageMeta({
  layout: 'dev',
  nav: {
    key: 'dev-tenant-misebox',
    label: 'Misebox',
    icon: 'i-lucide-utensils-crossed',
    desktop: true,
    group: 'misebox',
    layouts: ['dev'],
  },
})

const cfg = useFireUXConfig()

const openSections = reactive({
  status: false,
  ownership: false,
})

const toggleSection = (key: keyof typeof openSections) => {
  openSections[key] = !openSections[key]
}
</script>
