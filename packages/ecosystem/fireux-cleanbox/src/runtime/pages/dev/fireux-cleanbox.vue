<template>
  <UPage>
    <UPageHeader
      title="Dev · Cleanbox"
      description="Ops-facing inspection tools for workforce scheduling and job postings."
    />

    <UPageBody class="pagebody">
      <div class="space-y-4">
        <UCard>
          <div class="flex items-center justify-between gap-3">
            <div class="text-sm font-semibold">Images</div>
            <UButton
              variant="ghost"
              size="xs"
              @click="toggleSection('images')"
            >
              {{ openSections.images ? 'Hide' : 'Show' }}
            </UButton>
          </div>
          <div v-show="openSections.images" class="mt-4">
            <UCard>
              <template #header>
                <div class="flex items-center justify-between gap-3">
                  <div class="flex flex-col gap-1">
                    <h2 class="text-base font-semibold">Images</h2>
                    <p class="text-sm text-muted">
                      Preview common assets (core/ecosystem/app) in the running
                      runtime.
                    </p>
                  </div>
                  <UButton
                    size="sm"
                    to="/dev/images"
                    icon="i-lucide-arrow-up-right"
                  >
                    Open images
                  </UButton>
                </div>
              </template>

              <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div class="space-y-2">
                  <p class="text-xs font-medium text-muted">Ecosystem</p>
                  <div class="flex items-center gap-3">
                    <img
                      class="h-10 w-10 rounded-lg border"
                      src="/img/ecosystem/logo.png"
                      alt="Ecosystem logo"
                    />
                    <img
                      class="h-10 w-10 rounded-lg border"
                      src="/img/ecosystem/avatar.png"
                      alt="Ecosystem avatar"
                    />
                  </div>
                </div>

                <div class="space-y-2">
                  <p class="text-xs font-medium text-muted">App</p>
                  <div class="flex items-center gap-3">
                    <img
                      class="h-10 w-10 rounded-lg border"
                      src="/img/app/logo.png"
                      alt="App logo"
                    />
                    <img
                      class="h-10 w-10 rounded-lg border"
                      src="/img/app/pwa/icon-192.png"
                      alt="PWA icon 192"
                    />
                  </div>
                </div>

                <div class="space-y-2">
                  <p class="text-xs font-medium text-muted">Core</p>
                  <div class="flex items-center gap-3">
                    <img
                      class="h-10 w-10 rounded-lg border"
                      src="/img/core/brand/logo.png"
                      alt="FireUX logo"
                    />
                    <img
                      class="h-10 w-10 rounded-lg border bg-inverted p-1"
                      src="/img/core/auth/sign-in-light.svg"
                      alt="Auth illustration"
                    />
                  </div>
                </div>
              </div>
            </UCard>
          </div>
        </UCard>

        <UCard>
          <div class="flex items-center justify-between gap-3">
            <div class="text-sm font-semibold">Runtime snapshot</div>
            <UButton
              variant="ghost"
              size="xs"
              @click="toggleSection('runtime')"
            >
              {{ openSections.runtime ? 'Hide' : 'Show' }}
            </UButton>
          </div>
          <div v-show="openSections.runtime" class="mt-4">
            <UCard>
              <template #header>
                <div class="flex flex-col gap-1">
                  <h2 class="text-base font-semibold">Runtime snapshot</h2>
                  <p class="text-sm text-muted">
                    Live FireUX config for the active Cleanbox runtime.
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
                  <dd class="font-mono">
                    {{ cfg.modules.length ? cfg.modules.join(', ') : 'none' }}
                  </dd>
                </div>
              </dl>
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
    key: 'dev-cleanbox-ecosystem',
    label: 'Cleanbox',
    icon: 'i-lucide-broom',
    desktop: true,
    group: 'cleanbox',
    layouts: ['dev'],
  },
})

const cfg = useFireUXConfig()

const openSections = reactive({
  images: false,
  runtime: false,
})

const toggleSection = (key: keyof typeof openSections) => {
  openSections[key] = !openSections[key]
}
</script>
