<template>
  <div class="space-y-6">
    <UAlert
      v-if="pending"
      color="primary"
      variant="soft"
      icon="i-ph-spinner"
      title="Checking app configuration"
      description="Hang tight while we verify the active runtime configuration."
    />

    <template v-else-if="envData">
      <UAlert
        :color="status.color"
        :icon="status.icon"
        :title="status.title"
        :description="status.description"
        variant="soft"
      />

      <div class="flex flex-wrap items-center gap-2">
        <UBadge :color="requiredBadgeColor" variant="soft">
          Required: {{ summaryRequired }}
        </UBadge>
        <UBadge color="primary" variant="subtle">
          Optional (client): {{ summaryOptionalClient }}
        </UBadge>
        <UBadge :color="adminBadgeColor" variant="soft">
          Explicit Admin auth:
          {{ envData.server?.adminAuth?.configured ? 'detected' : 'not set' }}
        </UBadge>
        <UBadge :color="brandBadgeColor" variant="soft">
          Brand assets: {{ summaryBrand }}
        </UBadge>
        <UBadge :color="storageBadgeColor" variant="soft">
          Storage: {{ storageReady ? 'ready' : 'blocked' }}
        </UBadge>
      </div>

      <UAlert
        v-if="storageIssue"
        color="error"
        variant="soft"
        icon="i-lucide-database-zap"
        title="Firebase Storage unavailable"
        :description="storageIssue"
      />

      <UCard v-if="requiredVars.length">
        <template #header>
          <div class="flex items-center justify-between">
            <span class="font-medium">🔐 Required Configuration</span>
            <div class="flex items-center gap-2">
              <UButton
                size="xs"
                variant="soft"
                color="neutral"
                :icon="copiedRequired ? 'i-lucide-check' : 'i-lucide-copy'"
                @click="copyRequiredStatus"
              >
                {{ copiedRequired ? 'Copied' : 'Copy status' }}
              </UButton>
              <UBadge color="primary" variant="subtle">{{
                summaryRequired
              }}</UBadge>
            </div>
          </div>
        </template>
        <div class="space-y-2">
          <div
            v-for="envVar in requiredVars"
            :key="envVar.key"
            class="flex items-center justify-between rounded-lg border border-default px-3 py-2"
          >
            <span class="font-mono text-sm">{{ envVar.key }}</span>
            <UBadge
              :color="envVar.present ? 'success' : 'error'"
              variant="soft"
            >
              {{ envVar.present ? 'Set' : 'Missing' }}
            </UBadge>
          </div>
        </div>
        <div v-if="showProceed" class="mt-4 border-t border-default pt-4">
          <button
            type="button"
            class="inline-flex min-h-10 w-full items-center justify-center rounded-md bg-inverted px-4 py-2 text-sm font-semibold text-inverted shadow-sm transition hover:bg-inverted/90 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="proceedDisabled"
            @click="emit('proceed')"
          >
            {{ proceedPending ? 'Initializing...' : 'Continue' }}
          </button>
          <p
            v-if="proceedDisabled && !proceedPending"
            class="mt-2 text-xs text-muted"
          >
            Finish the required checks above to continue.
          </p>
        </div>
      </UCard>

      <UCard v-if="optionalClientVars.length">
        <template #header>
          <div class="flex items-center justify-between">
            <span class="font-medium">⚙️ Optional Configuration (Client)</span>
            <UBadge color="primary" variant="subtle">{{
              summaryOptionalClient
            }}</UBadge>
          </div>
        </template>
        <div class="space-y-2">
          <div
            v-for="envVar in optionalClientVars"
            :key="envVar.key"
            class="flex items-center justify-between rounded-lg border border-default px-3 py-2"
          >
            <span class="font-mono text-sm">{{ envVar.key }}</span>
            <UBadge
              :color="envVar.present ? 'success' : 'warning'"
              variant="soft"
            >
              {{ envVar.present ? 'Set' : 'Not set' }}
            </UBadge>
          </div>
        </div>
      </UCard>

      <UCard v-if="brandAssets.length">
        <template #header>
          <div class="flex items-center justify-between">
            <span class="font-medium">🎨 Brand Assets</span>
            <UBadge :color="brandBadgeColor" variant="soft">
              {{ summaryBrand }}
            </UBadge>
          </div>
        </template>
        <div class="grid gap-4 sm:grid-cols-2">
          <div
            v-for="asset in brandAssets"
            :key="asset.name"
            class="space-y-2 rounded-lg border border-default p-4"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <UIcon
                  :name="asset.ok ? 'i-ph-check-circle' : 'i-ph-warning'"
                />
                <span class="capitalize">{{ asset.name }}</span>
              </div>
              <UBadge :color="asset.ok ? 'success' : 'error'" variant="soft">
                {{ asset.ok ? 'Ready' : 'Issue' }}
              </UBadge>
            </div>
            <p class="text-sm text-muted">
              <template v-if="asset.ok">
                {{ asset.width }}×{{ asset.height }} detected.
              </template>
              <template v-else>
                {{ asset.reason }}
              </template>
            </p>
            <img
              v-if="asset.ok"
              :src="assetPreviewSrc(asset)"
              :alt="`${asset.name} preview`"
              class="brand-preview"
              loading="lazy"
            />
          </div>
        </div>
        <p class="text-sm text-muted">
          Complete the App's standard <code>/public/img/app</code> asset family
          before onboarding. Every App uses the same runtime paths; never loan
          another App's export to fill a missing asset.
        </p>
      </UCard>

      <UAccordion
        v-if="configurationMessages.length"
        :items="configurationMessages"
      >
        <template #body="{ item }">
          <ul class="mt-2 list-disc pl-5 text-sm">
            <li v-for="(message, index) in item.messages" :key="index">
              {{ message }}
            </li>
          </ul>
        </template>
      </UAccordion>

      <UAlert
        v-if="!overallValid"
        color="warning"
        variant="soft"
        icon="i-ph-list-checks"
        title="Next steps"
      >
        <ol class="list-decimal space-y-1 pl-5 text-sm">
          <li>
            Update the missing configuration in ecosystem config, app config, or
            local <code>.env</code>.
          </li>
          <li>Restart the development server: <code>pnpm dev</code>.</li>
          <li>Refresh this page to re-run the check.</li>
        </ol>
      </UAlert>
    </template>

    <UAlert
      v-else-if="error"
      color="error"
      variant="soft"
      icon="i-ph-x-circle"
      title="Failed to check configuration"
      :description="error"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { EnvCheckResponse } from '../../models/app-environment-check.ts'

const props = withDefaults(
  defineProps<{
    envData?: EnvCheckResponse | null
    pending?: boolean
    error?: string | null
    showProceed?: boolean
    proceedPending?: boolean
    proceedDisabled?: boolean
  }>(),
  {
    envData: null,
    pending: false,
    error: null,
    showProceed: false,
    proceedPending: false,
    proceedDisabled: true,
  }
)
const emit = defineEmits<{
  (event: 'proceed'): void
}>()

const pending = computed(() => props.pending ?? false)
const envData = computed(() => props.envData ?? null)
const error = computed(() => props.error ?? null)
const showProceed = computed(() => props.showProceed)
const proceedPending = computed(() => props.proceedPending)
const proceedDisabled = computed(() => props.proceedDisabled)

const requiredVars = computed(() => envData.value?.required ?? [])
const optionalClientVars = computed(() => envData.value?.optionalClient ?? [])
const brandAssets = computed(() => {
  const assets = envData.value?.brandAssets ?? []
  for (const asset of assets) {
    if (asset.ok === false && !asset.reason) {
      throw new Error(
        `Brand asset "${asset.name}" missing failure reason; update env-check`
      )
    }
  }
  return assets
})

const warnings = computed(() => envData.value?.warnings ?? [])
const notes = computed(() => envData.value?.notes ?? [])
const configurationMessages = computed(() =>
  [
    { value: 'warnings', label: 'Warnings', messages: warnings.value },
    { value: 'notes', label: 'Notes', messages: notes.value },
  ].filter((item) => item.messages.length)
)
const copiedRequired = ref(false)

const missingRequiredCount = computed(
  () => envData.value?.missingRequired?.length ?? 0
)
const hasRequiredIssues = computed(() => missingRequiredCount.value > 0)
const hasBrandIssues = computed(() =>
  brandAssets.value.some((asset) => asset.ok === false)
)
const storageReady = computed(
  () => envData.value?.server?.storage?.reachable ?? false
)
const storageIssue = computed(() => envData.value?.server?.storage?.issue ?? '')
const overallValid = computed(() => Boolean(envData.value?.isValid))

const status = computed(() => {
  if (hasRequiredIssues.value) {
    const count = missingRequiredCount.value
    const nouns = count === 1 ? 'item' : 'items'
    return {
      color: 'error' as const,
      icon: 'i-ph-warning',
      title: `${count} required ${nouns} missing`,
      description:
        'Resolve the issues below, restart the dev server, and refresh.',
    }
  }

  if (hasBrandIssues.value) {
    return {
      color: 'error' as const,
      icon: 'i-ph-warning',
      title: 'Brand assets incomplete',
      description:
        'Upload the required brand assets, restart the dev server, and refresh.',
    }
  }

  if (!storageReady.value) {
    return {
      color: 'error' as const,
      icon: 'i-lucide-database-zap',
      title: 'Firebase Storage unavailable',
      description: storageIssue.value || 'Check the configured Storage bucket.',
    }
  }

  return {
    color: 'success' as const,
    icon: 'i-ph-check-circle',
    title: 'Configuration checks passed',
    description:
      'Required variables, App-owned assets and Firebase Storage are ready.',
  }
})

const requiredBadgeColor = computed(() =>
  hasRequiredIssues.value ? 'error' : 'success'
)
const brandBadgeColor = computed(() =>
  hasBrandIssues.value ? 'error' : 'success'
)
const adminBadgeColor = computed(() =>
  envData.value?.server?.adminAuth?.configured ? 'success' : 'neutral'
)
const storageBadgeColor = computed(() =>
  storageReady.value ? 'success' : 'error'
)

const assetPreviewSrc = (asset: { path: string }) => {
  const sourcePath = asset.path ?? ''
  if (!sourcePath) return '/img/core/brand/wordmark-light.png'
  if (sourcePath.startsWith('/')) return sourcePath
  if (sourcePath.startsWith('img/')) return `/${sourcePath}`
  return '/img/core/brand/wordmark-light.png'
}

const requiredStatusText = computed(() =>
  requiredVars.value
    .map((envVar) => `${envVar.key}${envVar.present ? 'Set' : 'Missing'}`)
    .join('\n')
)

async function copyRequiredStatus() {
  if (!import.meta.client) return
  if (!requiredStatusText.value) return

  await navigator.clipboard.writeText(requiredStatusText.value)
  copiedRequired.value = true
  window.setTimeout(() => {
    copiedRequired.value = false
  }, 1500)
}

const summaryRequired = computed(
  () => envData.value?.summary?.required ?? '0/0'
)
const summaryOptionalClient = computed(
  () => envData.value?.summary?.optionalClient ?? '0/0'
)
const summaryBrand = computed(
  () => envData.value?.summary?.brandAssets ?? '0/0'
)
</script>

<style scoped>
.brand-preview {
  max-width: 100%;
  height: auto;
  border-radius: var(--ui-radius);
  border: 1px solid var(--ui-border);
  background: var(--ui-bg);
  padding: calc(var(--spacing) * 2);
}
</style>
