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
          Admin SDK:
          {{ envData.server?.adminAuth?.configured ? 'configured' : 'missing' }}
        </UBadge>
        <UBadge :color="brandBadgeColor" variant="soft">
          Brand assets: {{ summaryBrand }}
        </UBadge>
      </div>

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
            class="flex items-center justify-between rounded-lg border border-[var(--ui-border)] px-3 py-2"
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
            class="flex items-center justify-between rounded-lg border border-[var(--ui-border)] px-3 py-2"
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
            class="space-y-2 rounded-lg border border-[var(--ui-border)] p-4"
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
            <p class="text-sm text-[var(--ui-text-muted)]">
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
        <p class="text-sm text-[var(--ui-text-muted)]">
          Copy the exported app assets from
          <code>figma-export/apps/&lt;app-id&gt;/</code> into
          <code>/public/img/app</code> before onboarding. For temporary local
          console work, you may loan another app's export if the target app
          export folder is still empty.
        </p>
      </UCard>

      <UAccordion
        v-if="warnings.length || notes.length"
        variant="soft"
        size="sm"
      >
        <UAccordionItem
          v-if="warnings.length"
          value="warnings"
          title="Warnings"
        >
          <ul class="mt-2 list-disc pl-5 text-sm">
            <li v-for="(w, index) in warnings" :key="index">{{ w }}</li>
          </ul>
        </UAccordionItem>
        <UAccordionItem v-if="notes.length" value="notes" title="Notes">
          <ul class="mt-2 list-disc pl-5 text-sm">
            <li v-for="(n, index) in notes" :key="index">{{ n }}</li>
          </ul>
        </UAccordionItem>
      </UAccordion>

      <UAlert
        v-if="!overallValid"
        color="warning"
        variant="soft"
        icon="i-ph-list-checks"
        title="Next steps"
      >
        <ol class="list-decimal space-y-1 pl-5 text-sm">
          <li>Update the missing configuration in ecosystem config, app config, or local <code>.env</code>.</li>
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
import type { EnvCheckResponse } from '../../../../composables/fireux/app/utils/env-check.types'

const props = withDefaults(
  defineProps<{
    envData?: EnvCheckResponse | null
    pending?: boolean
    error?: string | null
  }>(),
  {
    envData: null,
    pending: false,
    error: null,
  }
)

const pending = computed(() => props.pending ?? false)
const envData = computed(() => props.envData ?? null)
const error = computed(() => props.error ?? null)

const requiredVars = computed(() => envData.value?.required ?? [])
const optionalClientVars = computed(() => {
  if (!envData.value) return []
  if (envData.value.optionalClient?.length) return envData.value.optionalClient
  return envData.value.optional ?? []
})
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
const copiedRequired = ref(false)

const missingRequiredCount = computed(
  () => envData.value?.missingRequired?.length ?? 0
)
const hasRequiredIssues = computed(() => missingRequiredCount.value > 0)
const hasBrandIssues = computed(() =>
  brandAssets.value.some((asset) => asset.ok === false)
)
const adminConfigured = computed(
  () => envData.value?.server?.adminAuth?.configured ?? false
)
const hasAdminIssues = computed(() => !adminConfigured.value)
const overallValid = computed(
  () =>
    !hasRequiredIssues.value && !hasBrandIssues.value && !hasAdminIssues.value
)

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

  if (hasAdminIssues.value) {
    return {
      color: 'error' as const,
      icon: 'i-ph-warning',
      title: 'Firebase Admin SDK missing',
      description:
        'Add FIREBASE_SERVICE_ACCOUNT (or file) so server features and onboarding can run.',
    }
  }

  return {
    color: 'success' as const,
    icon: 'i-ph-check-circle',
    title: 'Ready to create app',
    description: 'All required variables and assets look good.',
  }
})

const requiredBadgeColor = computed(() =>
  hasRequiredIssues.value ? 'error' : 'success'
)
const brandBadgeColor = computed(() =>
  hasBrandIssues.value ? 'error' : 'success'
)
const adminBadgeColor = computed(() =>
  adminConfigured.value ? 'success' : 'error'
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
  () =>
    envData.value?.summary?.optionalClient ??
    envData.value?.summary?.optional ??
    '0/0'
)
const summaryBrand = computed(
  () => envData.value?.summary?.brandAssets ?? '0/0'
)
</script>

<style scoped>
.brand-preview {
  max-width: 100%;
  height: auto;
  border-radius: var(--radius-sm);
  border: 1px solid var(--ui-border);
  background: var(--ui-bg);
  padding: var(--space-2);
}
</style>
