<!-- Concurrent edit — 2026-07-21 17:00 CEST — Dashboard Family pass: keep Developer focused on media, build context and field authority. -->
<!-- Concurrent edit — 2026-07-21 20:23 CEST — Developer Dashboard cleanup: prioritize media and build context while folding technical detail away. -->
<template>
  <ClientOnly>
    <div class="space-y-4">
      <div
        class="grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(18rem,0.8fr)] xl:items-start"
      >
        <AppEditMedia :app="app" />

        <UPageCard
          title="Build connection"
          description="The identifiers this App resolves at runtime."
          icon="i-lucide-braces"
          variant="subtle"
          class="h-full"
        >
          <dl class="divide-y divide-default">
            <div
              v-for="row in appSummary"
              :key="row.label"
              class="grid gap-1 py-3 first:pt-0 last:pb-0"
            >
              <dt
                class="text-xs font-medium uppercase tracking-wide text-dimmed"
              >
                {{ row.label }}
              </dt>
              <dd class="break-words font-mono text-sm text-highlighted">
                {{ row.value }}
              </dd>
              <dd v-if="row.detail" class="text-xs text-muted">
                {{ row.detail }}
              </dd>
            </div>
          </dl>
        </UPageCard>
      </div>

      <MoleculesDisclosurePanel
        title="Technical details"
        description="Field ownership and the canonical App model."
        icon="i-lucide-git-branch"
        :default-open="false"
      >
        <div class="space-y-4 pt-3">
          <UPageCard
            title="Field ownership"
            description="The product surface responsible for each App field family."
            variant="subtle"
          >
            <div class="divide-y divide-default">
              <div
                v-for="section in ownershipSections"
                :key="section.key"
                class="grid gap-2 py-4 first:pt-0 last:pb-0 sm:grid-cols-[8rem_minmax(0,1fr)]"
              >
                <div
                  class="flex items-center gap-2 font-medium text-highlighted"
                >
                  <UIcon :name="section.icon" class="size-4 text-primary" />
                  <span>{{ section.label }}</span>
                </div>
                <div class="min-w-0">
                  <p class="text-sm leading-6 text-muted">
                    {{ section.description }}
                  </p>
                  <p class="mt-1 break-words font-mono text-xs text-dimmed">
                    {{ section.fields.join(' · ') }}
                  </p>
                </div>
              </div>
            </div>
          </UPageCard>

          <DevDebugPanel
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
      </MoleculesDisclosurePanel>
    </div>

    <template #fallback>
      <MoleculesStateCard
        entity="developer workspace"
        kind="document"
        loading
      />
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
  control: [
    'ecosystem_id',
    'status',
    'role',
    'name',
    'short_name',
    'self_join_enabled',
  ],
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
