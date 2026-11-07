<!-- Concurrent edit — 2026-07-21 17:00 CEST — Dashboard Family pass: keep Developer focused on media, build context and field authority. -->
<!-- Concurrent edit — 2026-07-21 20:23 CEST — Developer Dashboard cleanup: prioritize media and build context while folding technical detail away. -->
<template>
  <ClientOnly>
    <div class="pagebody">
      <div>
        <AppEditMedia :app="app" />

        <UPageCard
          title="Build connection"
          description="The identifiers this App resolves at runtime."
          icon="i-lucide-braces"
          variant="subtle"
        >
          <dl class="fx-card__detail-grid">
            <div v-for="row in appSummary" :key="row.label">
              <dt>
                {{ row.label }}
              </dt>
              <dd>
                {{ row.value }}
              </dd>
              <dd v-if="row.detail">
                {{ row.detail }}
              </dd>
            </div>
          </dl>
        </UPageCard>
      </div>

      <FireDisclosurePanel
        title="Technical details"
        description="Field ownership and the canonical App model."
        icon="i-lucide-git-branch"
        :default-open="false"
      >
        <div>
          <UPageCard
            title="Field ownership"
            description="The product surface responsible for each App field family."
            variant="subtle"
          >
            <div>
              <div v-for="section in ownershipSections" :key="section.key">
                <div>
                  <UIcon :name="section.icon" />
                  <span>{{ section.label }}</span>
                </div>
                <div>
                  <p>
                    {{ section.description }}
                  </p>
                  <p>
                    {{ section.fields.join(' · ') }}
                  </p>
                </div>
              </div>
            </div>
          </UPageCard>

          <FireDiagnosticsDebugPanel
            object-origin="fetched"
            launcher
            include-route
            title="App model (JSON)"
            context="dashboard/developer · canonical App"
            :objects="app"
            :derived="{}"
            :default-open="false"
          />
        </div>
      </FireDisclosurePanel>
    </div>

    <template #fallback>
      <FireStateCard entity="developer workspace" kind="document" loading />
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { App } from '../../models/app.model.ts'

const props = defineProps<{ app: App }>()
const app = computed(() => props.app)

const display = (value: unknown) => {
  const text = String(value ?? '').trim()
  return text || 'Not set'
}

const appFieldGroups = {
  developer: ['media'],
  control: ['ecosystem_id', 'status', 'role', 'name', 'short_name'],
  admin: ['description'],
  system: ['id', 'created', 'updated'],
} as const

const appSummary = computed(() => {
  return [
    { label: 'App ID', value: display(props.app.id), detail: '' },
    {
      label: 'Ecosystem',
      value: display(props.app.ecosystem_id),
      detail: '',
    },
  ]
})

const ownershipSections = [
  {
    key: 'developer',
    label: 'Developer',
    description:
      'Builds and checks App media, database binding and repo metadata.',
    icon: 'i-lucide-code-xml',
    fields: appFieldGroups.developer,
  },
  {
    key: 'control',
    label: 'App control',
    description: 'Changes App identity, relationships, lifecycle and routing.',
    icon: 'i-lucide-panels-top-left',
    fields: appFieldGroups.control,
  },
  {
    key: 'admin',
    label: 'Admin',
    description: 'Runs the App and maintains its public story.',
    icon: 'i-lucide-shield-check',
    fields: appFieldGroups.admin,
  },
  {
    key: 'system',
    label: 'System',
    description: 'Maintains canonical identity, stamps and derived values.',
    icon: 'i-lucide-cpu',
    fields: appFieldGroups.system,
  },
] as const
</script>
