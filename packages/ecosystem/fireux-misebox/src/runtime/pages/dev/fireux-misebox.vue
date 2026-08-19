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
                  <p class="text-sm text-muted">
                    Misebox provides ecosystem identity; apps select domain capabilities explicitly.
                  </p>
                </div>
              </template>

              <dl class="grid gap-4 sm:grid-cols-2 text-sm">
                <div>
                  <dt class="text-muted">Ecosystem</dt>
                  <dd class="font-medium">{{ cfg.ecosystem }}</dd>
                </div>
                <div>
                  <dt class="text-muted">Role</dt>
                  <dd class="font-medium capitalize">{{ cfg.role }}</dd>
                </div>
                <div>
                  <dt class="text-muted">App ID</dt>
                  <dd class="font-mono">{{ cfg.appId || 'not set' }}</dd>
                </div>
                <div>
                  <dt class="text-muted">Modules</dt>
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
                  <p class="text-sm text-muted">
                    Canonical ownership after migration.
                  </p>
                </div>
              </template>

              <ul class="list-disc fx-list-stack text-sm text-toned">
                <li>Misebox ecosystem: Firebase binding, runtime identity, public assets, and shared tenant chrome.</li>
                <li>Extension packages: reusable domain routes, models, composables, and UI.</li>
                <li>Project apps: capability selection, target configuration, content, and branding.</li>
              </ul>
            </UCard>
          </div>
        </UCard>
      </div>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig';
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
