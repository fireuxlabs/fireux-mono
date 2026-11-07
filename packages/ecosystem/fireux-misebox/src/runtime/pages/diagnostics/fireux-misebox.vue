<template>
  <UPage>
    <UPageHeader
      title="Diagnostics · Misebox"
      description="Misebox ecosystem overview for the active runtime."
    />

    <UPageBody class="pagebody">
      <div>
        <UCard>
          <div class="card__header">
            <div>Ecosystem status</div>
            <UButton variant="ghost" size="xs" @click="toggleSection('status')">
              {{ openSections.status ? 'Hide' : 'Show' }}
            </UButton>
          </div>
          <div v-show="openSections.status">
            <UCard>
              <template #header>
                <div>
                  <h2 class="fx-type-card-heading">Ecosystem status</h2>
                  <p>
                    Misebox provides ecosystem identity; apps select domain
                    capabilities explicitly.
                  </p>
                </div>
              </template>

              <dl>
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
                  <dd>
                    {{ cfg.modules.length ? cfg.modules.join(', ') : 'none' }}
                  </dd>
                </div>
              </dl>
            </UCard>
          </div>
        </UCard>

        <UCard>
          <div class="card__header">
            <div>Domain ownership</div>
            <UButton
              variant="ghost"
              size="xs"
              @click="toggleSection('ownership')"
            >
              {{ openSections.ownership ? 'Hide' : 'Show' }}
            </UButton>
          </div>
          <div v-show="openSections.ownership">
            <UCard>
              <template #header>
                <div>
                  <h2 class="fx-type-card-heading">Domain ownership</h2>
                  <p>Canonical ownership after migration.</p>
                </div>
              </template>

              <ul class="fx-list-stack">
                <li>
                  Misebox ecosystem: Firebase binding, runtime identity, public
                  assets, and shared tenant chrome.
                </li>
                <li>
                  Extension packages: reusable domain routes, models,
                  composables, and UI.
                </li>
                <li>
                  Project apps: capability selection, target configuration,
                  content, and branding.
                </li>
              </ul>
            </UCard>
          </div>
        </UCard>
      </div>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { reactive } from 'vue'

definePageMeta({
  layout: 'diagnostics',
  nav: {
    key: 'dev-tenant-misebox',
    label: 'Misebox',
    icon: 'i-lucide-utensils-crossed',
    desktop: true,
    group: 'misebox',
    layouts: ['diagnostics'],
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
