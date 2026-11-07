<template>
  <UPage>
    <UPageHeader
      title="Diagnostics · Bringli"
      description="Bringli ecosystem overview for the active runtime."
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
                    Bringli is configured as a local-first producer marketplace
                    ecosystem.
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
            <div>Bringli defaults</div>
            <UButton
              variant="ghost"
              size="xs"
              @click="toggleSection('defaults')"
            >
              {{ openSections.defaults ? 'Hide' : 'Show' }}
            </UButton>
          </div>
          <div v-show="openSections.defaults">
            <UCard>
              <template #header>
                <div>
                  <h2 class="fx-type-card-heading">Bringli defaults</h2>
                  <p>
                    Runtime defaults keep Drop and Places enabled unless
                    overridden in app config.
                  </p>
                </div>
              </template>

              <ul class="fx-list-stack">
                <li>
                  Drop extension should own supplier and local delivery-facing
                  profile flows.
                </li>
                <li>
                  Places extension remains available for location and
                  service-area workflows.
                </li>
                <li>
                  Firebase keys in ecosystem config are placeholders until
                  project provisioning is completed.
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
    key: 'dev-tenant-bringli',
    label: 'Bringli',
    icon: 'i-lucide-store',
    desktop: true,
    group: 'bringli',
    layouts: ['diagnostics'],
  },
})

const cfg = useFireUXConfig()

const openSections = reactive({
  status: false,
  defaults: false,
})

const toggleSection = (key: keyof typeof openSections) => {
  openSections[key] = !openSections[key]
}
</script>
