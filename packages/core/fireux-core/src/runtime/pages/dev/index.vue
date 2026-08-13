<template>
  <UPage>
    <UPageHeader class="border-b-0"
      title="Dev · Overview"
      description="Diagnostics and inspection utilities for the active FireUX runtime."
    />

    <UPageBody class="pagebody space-y-6">
    <!-- Intro -->
    
    <UCard>
      <template #header>
        <div class="flex flex-col gap-1">
          <h1>Development Tools</h1>
          <p class="text-sm text-muted">
            Overview of diagnostics and inspection utilities available in the
            dev layout.
          </p>
        </div>
      </template>
      <p class="text-sm text-toned">
        Use the navigation to open specific tools such as Apps, Users, or FireUX
        runtime data.
      </p>
    </UCard>

    <DevBinding :app="bindingApp" :apps="bindingApps" />

    <UCard>
      <template #header>
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div class="space-y-1">
            <h2>App media</h2>
            <p class="text-sm text-muted">
              Publish this App's image family to its configured Firebase
              Storage bucket.
            </p>
          </div>
          <UButton
            size="sm"
            icon="i-lucide-cloud-upload"
            :loading="mediaSyncPending"
            :disabled="mediaSyncPending"
            @click="syncRuntimeMedia"
          >
            Sync App media
          </UButton>
        </div>
      </template>

      <p v-if="mediaSyncMessage" class="text-sm text-toned">
        {{ mediaSyncMessage }}
      </p>
      <p v-if="mediaSyncError" class="text-sm text-error">
        {{ mediaSyncError }}
      </p>
    </UCard>

    <!-- Runtime Summary -->
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex flex-col gap-1">
            <h2>⚙️ FireUX Runtime</h2>
            <p class="text-sm text-muted">
              Values resolved from Nuxt runtime config & env (demo).
            </p>
          </div>
          <div class="flex items-center gap-2">
            <UButton
              size="xs"
              variant="ghost"
              icon="i-lucide-copy"
              @click="copyRuntime"
            >
              Copy JSON
            </UButton>
            <UButton
              size="xs"
              variant="ghost"
              :icon="
                showRuntimeJson
                  ? 'i-lucide-chevron-up'
                  : 'i-lucide-chevron-down'
              "
              @click="toggleRuntimeJson"
            >
              {{ showRuntimeJson ? 'Hide JSON' : 'Show JSON' }}
            </UButton>
          </div>
        </div>
      </template>

      <ul class="space-y-2 text-sm">
        <li class="flex items-center justify-between gap-3">
          <span class="font-medium">ecosystem</span>
          <span class="text-muted">
            {{ cfg.ecosystem }}
          </span>
        </li>
        <li class="flex items-center justify-between gap-3">
          <span class="font-medium">role</span>
          <span class="text-muted">{{ cfg.role }}</span>
        </li>
        <li class="flex items-center justify-between gap-3">
          <span class="font-medium">appId</span>
          <span class="text-muted">{{ cfg.appId }}</span>
        </li>
        <li class="flex items-center justify-between gap-3">
          <span class="font-medium">appName</span>
          <span class="text-muted">{{
            cfg.appName
          }}</span>
        </li>
        <li class="flex items-center justify-between gap-3">
          <span class="font-medium">modules</span>
          <span class="text-muted">
            <!-- TODO(fallback-review): Investigate whether empty module arrays should surface errors instead of showing 'none' -->
            {{ (cfg.modules || []).join(', ') || 'none' }}
          </span>
        </li>
        <li class="flex items-center justify-between gap-3">
          <span class="font-medium">devMode</span>
          <span class="text-muted">{{
            String(cfg.devMode)
          }}</span>
        </li>

        <li
          v-if="cfg.primaryColor"
          class="flex items-center justify-between gap-3"
        >
          <span class="font-medium">primaryColor</span>
          <div class="flex items-center gap-2">
            <div
              class="h-5 w-5 rounded border border-default"
            />
            <span class="text-muted">{{
              cfg.primaryColor
            }}</span>
          </div>
        </li>

        <li
          v-if="cfg.neutralColor"
          class="flex items-center justify-between gap-3"
        >
          <span class="font-medium">neutralColor</span>
          <div class="flex items-center gap-2">
            <div
              class="h-5 w-5 rounded border border-default"
            />
            <span class="text-muted">{{
              cfg.neutralColor
            }}</span>
          </div>
        </li>

        <li
          v-if="cfg.secondaryColor"
          class="flex items-center justify-between gap-3"
        >
          <span class="font-medium">secondaryColor</span>
          <div class="flex items-center gap-2">
            <div
              class="h-5 w-5 rounded border border-default"
            />
            <span class="text-muted">
              {{ cfg.secondaryColor }}
            </span>
          </div>
        </li>
      </ul>
    </UCard>

    <!-- Firebase Admin SDK status -->
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex flex-col gap-1">
            <h2>🔥 Firebase Admin SDK</h2>
            <p class="text-sm text-muted">
              Explicit server-side credential configuration. ADC may also be
              available at runtime.
            </p>
          </div>
          <div class="flex items-center gap-2">
            <UBadge :color="adminStatus.color" variant="soft">
              {{ adminStatus.label }}
            </UBadge>
            <UButton
              size="xs"
              variant="ghost"
              :loading="envPending"
              icon="i-lucide-refresh-ccw"
              @click="refreshEnvCheck"
            >
              Refresh
            </UButton>
          </div>
        </div>
      </template>

      <div class="space-y-3 text-sm text-toned">
        <p>
          {{ adminStatus.description }}
        </p>

        <ul class="space-y-1">
          <li class="flex items-center justify-between gap-3">
            <span class="font-medium">JSON env string</span>
            <span>{{ adminAuth?.json ? 'present' : 'missing' }}</span>
          </li>
          <li class="flex items-center justify-between gap-3">
            <span class="font-medium">Split env keys</span>
            <span>
              {{ adminAuth?.splitKeys?.FIREBASE_PROJECT_ID ? '✓' : '✗' }}
              projectId /
              {{ adminAuth?.splitKeys?.FIREBASE_CLIENT_EMAIL ? '✓' : '✗' }}
              clientEmail /
              {{ adminAuth?.splitKeys?.FIREBASE_PRIVATE_KEY ? '✓' : '✗' }}
              privateKey
            </span>
          </li>
          <li class="flex items-center justify-between gap-3">
            <span class="font-medium">Credential file env</span>
            <span>{{ adminAuth?.file ? 'detected' : 'not found' }}</span>
          </li>
        </ul>

        <template v-if="adminNotes.length">
          <div class="space-y-1">
            <h3 class="text-sm font-medium">Notes</h3>
            <ul class="list-disc pl-5 space-y-1">
              <li v-for="note in adminNotes" :key="note">{{ note }}</li>
            </ul>
          </div>
        </template>
      </div>
    </UCard>

    <!-- Runtime JSON -->
    <UCard v-if="showRuntimeJson">
      <template #header>
        <h2>Runtime JSON</h2>
      </template>
      <DevJson
        :title="'Runtime (JSON)'"
        context="dev index · runtime"
        :data="{ runtime: cfg }"
        :default-open="false"
      />
    </UCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
// Concurrent edit — 2026-07-20 16:18 CEST — Repo Efficiency Pass 1 of 6: inspect raw Apps through the authenticated dev API across all app roles.
import { computed, ref } from 'vue'
import { useDevAppCollection } from '../../composables/dev/useDevAppCollection'
import { useFireUXConfig } from '../../composables/fireux/app/FireUXConfig'
import { useAppEnvCheck } from '../../composables/fireux/app/utils/useAppEnvCheck'
import { syncAppMediaToStorage } from '../../composables/fireux/firestore/core/app/utils/appMediaSync'

definePageMeta({
  title: 'Dev · Overview',
  description: 'Diagnostics and inspection utilities for the active FireUX runtime.',
  layout: 'dev',
  nav: {
    key: 'dev-index',
    label: 'Overview',
    icon: 'i-lucide-wrench',
    desktop: true,
    group: 'core',
    layouts: ['dev'],
    order: 10,
  },
})

const cfg = useFireUXConfig()
if (!cfg.ecosystem || !cfg.ecosystem.trim()) {
  throw new Error('[dev] FireUX config missing ecosystem name')
}
const showRuntimeJson = ref(false)
const mediaSyncPending = ref(false)
const mediaSyncMessage = ref('')
const mediaSyncError = ref('')

const { apps } = useDevAppCollection()
const bindingApps = computed(() =>
  cfg.isTenant
    ? apps.value.filter((app) => app.id === cfg.appId)
    : apps.value ?? []
)
const bindingApp = computed(
  () => bindingApps.value.find((item) => item?.id === cfg.appId) ?? null
)

const {
  data: envData,
  pending: envPending,
  refresh: refreshEnv,
} = await useAppEnvCheck()

const adminAuth = computed(() => envData.value?.server?.adminAuth ?? null)
const explicitAdminConfigured = computed(() => adminAuth.value?.configured ?? false)

const adminNotes = computed(() => {
  const notes = envData.value?.notes ?? []
  return notes.filter((note: string) =>
    /admin sdk|credential|adc/i.test(note)
  )
})

const adminStatus = computed(() => {
  if (envPending.value) {
    return {
      color: 'info' as const,
      label: 'checking…',
      description: 'Validating Firebase Admin configuration…',
    }
  }

  if (explicitAdminConfigured.value) {
    let source = adminAuth.value?.file
      ? 'Using an explicit credential file environment variable.'
      : 'Explicit credential configuration detected.'
    if (adminAuth.value?.json) {
      source = 'Using FIREBASE_SERVICE_ACCOUNT JSON.'
    } else if (
      adminAuth.value?.splitKeys?.FIREBASE_PROJECT_ID &&
      adminAuth.value?.splitKeys?.FIREBASE_CLIENT_EMAIL &&
      adminAuth.value?.splitKeys?.FIREBASE_PRIVATE_KEY
    ) {
      source = 'Using split FIREBASE_* env keys.'
    }

    return {
      color: 'success' as const,
      label: 'explicit config',
      description: source,
    }
  }

  return {
    color: 'neutral' as const,
    label: 'ADC unprobed',
    description:
      'No explicit credential env was detected. Standard ADC may still initialize Firebase Admin at runtime.',
  }
})

const refreshEnvCheck = () => {
  void refreshEnv()
}

const syncRuntimeMedia = async () => {
  if (mediaSyncPending.value) return

  mediaSyncPending.value = true
  mediaSyncMessage.value = ''
  mediaSyncError.value = ''

  try {
    const result = await syncAppMediaToStorage()
    const uploadedCount = Object.values(result.uploaded).filter(Boolean).length
    mediaSyncMessage.value = `${uploadedCount} asset(s) published for ${result.appId}.`
    if (result.failed.length) {
      mediaSyncError.value = result.failed
        .map((entry) => `${entry.kind}: ${entry.message}`)
        .join(' | ')
    }
  } catch (error) {
    mediaSyncError.value =
      error instanceof Error && error.message.trim()
        ? error.message.trim()
        : 'App media sync failed.'
  } finally {
    mediaSyncPending.value = false
  }
}

const copyRuntime = () => {
  if (typeof navigator === 'undefined' || !navigator.clipboard) return
  navigator.clipboard.writeText(JSON.stringify({ runtime: cfg }, null, 2))
}

const toggleRuntimeJson = () => {
  showRuntimeJson.value = !showRuntimeJson.value
}
</script>
