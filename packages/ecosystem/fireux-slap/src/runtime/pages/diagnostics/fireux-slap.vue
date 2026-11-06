<template>
  <UPage>
    <UPageHeader
      title="Diagnostics · Apps That Slap"
      description="Apps That Slap ecosystem overview for the active runtime."
    />

    <UPageBody class="pagebody space-y-6">
      <UCard>
        <template #header>
          <div class="flex flex-col gap-1">
            <h2 class="fx-type-card-heading">Ecosystem status</h2>
            <p>
              Apps That Slap is configured as an ecosystem package for this
              runtime.
            </p>
          </div>
        </template>

        <dl class="grid gap-4 sm:grid-cols-2">
          <div>
            <dt>Ecosystem</dt>
            <dd>{{ cfg.ecosystem }}</dd>
          </div>
          <div>
            <dt>Role</dt>
            <dd>{{ cfg.role }}</dd>
          </div>
          <div>
            <dt>App ID</dt>
            <dd>{{ cfg.appId || 'not set' }}</dd>
          </div>
          <div>
            <dt>Modules</dt>
            <dd>{{ cfg.modules.length ? cfg.modules.join(', ') : 'none' }}</dd>
          </div>
        </dl>
      </UCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'

definePageMeta({
  layout: 'diagnostics',
  nav: {
    key: 'dev-tenant-slap',
    label: 'Apps That Slap',
    icon: 'i-lucide-store',
    desktop: true,
    group: 'slap',
    layouts: ['diagnostics'],
  },
})

const cfg = useFireUXConfig()
</script>
