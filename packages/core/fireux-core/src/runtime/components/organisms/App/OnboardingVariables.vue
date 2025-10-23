<template>
  <div class="space-y-6">
    <UAlert
      v-if="pending"
      color="primary"
      variant="soft"
      icon="i-ph-spinner"
      title="Checking environment variables"
      description="Hang tight while we verify your configuration."
    />

    <template v-else-if="envData">
      <UAlert
        :color="envData.isValid ? 'success' : 'error'"
        :icon="envData.isValid ? 'i-ph-check-circle' : 'i-ph-warning'"
        :title="
          envData.isValid
            ? 'Ready to create app'
            : `${envData.missingRequired?.length || 0} required items missing`
        "
        :description="
          envData.isValid
            ? 'All required variables and assets look good.'
            : 'Resolve the issues below, restart the dev server, and refresh.'
        "
        variant="soft"
      />

      <div class="flex flex-wrap items-center gap-2">
        <UBadge :color="envData.isValid ? 'success' : 'error'" variant="soft">
          Required: {{ summaryRequired }}
        </UBadge>
        <UBadge color="primary" variant="subtle">
          Optional (client): {{ summaryOptionalClient }}
        </UBadge>
        <UBadge color="primary" variant="subtle">
          Optional (server): {{ summaryOptionalServer }}
        </UBadge>
        <UBadge
          :color="envData.server?.adminAuth?.configured ? 'success' : 'warning'"
          variant="soft"
        >
          Admin SDK:
          {{ envData.server?.adminAuth?.configured ? 'configured' : 'missing' }}
        </UBadge>
        <UBadge color="primary" variant="subtle">
          Brand assets: {{ summaryBrand }}
        </UBadge>
      </div>

      <UCard v-if="requiredVars.length">
        <template #header>
          <div class="flex items-center justify-between">
            <span class="font-medium">🔐 Required Variables</span>
            <UBadge color="primary" variant="subtle">{{
              summaryRequired
            }}</UBadge>
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
            <span class="font-medium">⚙️ Optional Variables (Client)</span>
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

      <UCard v-if="optionalServerVars.length">
        <template #header>
          <div class="flex items-center justify-between">
            <span class="font-medium">🛠 Optional Variables (Server)</span>
            <UBadge color="primary" variant="subtle">{{
              summaryOptionalServer
            }}</UBadge>
          </div>
        </template>
        <div class="space-y-2">
          <div
            v-for="envVar in optionalServerVars"
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
            <UBadge color="primary" variant="subtle">{{ summaryBrand }}</UBadge>
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
                {{ asset.reason || 'Missing asset in /public/img/brand' }}
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
          Replace files in <code>/public/img/brand</code> or update storage URLs
          to resolve issues.
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
        v-if="!envData.isValid"
        color="warning"
        variant="soft"
        icon="i-ph-list-checks"
        title="Next steps"
      >
        <ol class="list-decimal space-y-1 pl-5 text-sm">
          <li>Update your <code>.env</code> file with the missing entries.</li>
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
      title="Failed to check environment"
      :description="error"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type EnvVarEntry = { key: string; present: boolean; value?: string }
type AdminAuthStatus = {
  json: boolean
  splitKeys: {
    FIREBASE_PROJECT_ID: boolean
    FIREBASE_CLIENT_EMAIL: boolean
    FIREBASE_PRIVATE_KEY: boolean
  }
  configured: boolean
}
type BrandAssetCheck = {
  name: string
  path: string
  ok: boolean
  reason?: string
  width?: number
  height?: number
}
interface EnvCheckResponse {
  isValid: boolean
  required: EnvVarEntry[]
  optionalClient: EnvVarEntry[]
  optional?: EnvVarEntry[]
  server?: {
    adminAuth: AdminAuthStatus
    optional: EnvVarEntry[]
  }
  missingRequired: string[]
  summary: {
    required: string
    optionalClient?: string
    optional?: string
    optionalServer?: string
    brandAssets?: string
  }
  warnings: string[]
  notes: string[]
  brandAssets: BrandAssetCheck[]
}

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
const optionalServerVars = computed(() => envData.value?.server?.optional ?? [])
const brandAssets = computed(() => envData.value?.brandAssets ?? [])

const warnings = computed(() => envData.value?.warnings ?? [])
const notes = computed(() => envData.value?.notes ?? [])

const assetPreviewSrc = (asset: { path: string }) => {
  const segments = asset.path?.split('/') ?? []
  return `/img/brand/${segments.at(-1) ?? ''}`
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
const summaryOptionalServer = computed(
  () => envData.value?.summary?.optionalServer ?? '0/0'
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
