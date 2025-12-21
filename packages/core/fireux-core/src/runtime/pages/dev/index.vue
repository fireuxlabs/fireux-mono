<template>
  <div class="space-y-6">
    <!-- Intro -->
    <UCard>
      <template #header>
        <div class="flex flex-col gap-1">
          <h1>Development Tools</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Overview of diagnostics and inspection utilities available in the
            dev layout.
          </p>
        </div>
      </template>
      <p class="text-sm text-gray-600 dark:text-gray-300">
        Use the navigation to open specific tools such as Apps, Users, or FireUX
        runtime data.
      </p>
    </UCard>

    <!-- Runtime Summary -->
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex flex-col gap-1">
            <h2>⚙️ FireUX Runtime</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Values resolved from Nuxt runtime config & env (read-only).
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
          <span class="text-gray-500 dark:text-gray-400">
            {{ cfg.ecosystem }}
          </span>
        </li>
        <li class="flex items-center justify-between gap-3">
          <span class="font-medium">role</span>
          <span class="text-gray-500 dark:text-gray-400">{{ cfg.role }}</span>
        </li>
        <li class="flex items-center justify-between gap-3">
          <span class="font-medium">appId</span>
          <span class="text-gray-500 dark:text-gray-400">{{ cfg.appId }}</span>
        </li>
        <li class="flex items-center justify-between gap-3">
          <span class="font-medium">appName</span>
          <span class="text-gray-500 dark:text-gray-400">{{
            cfg.appName
          }}</span>
        </li>
        <li class="flex items-center justify-between gap-3">
          <span class="font-medium">modules</span>
          <span class="text-gray-500 dark:text-gray-400">
            <!-- TODO(fallback-review): Investigate whether empty module arrays should surface errors instead of showing 'none' -->
            {{ (cfg.modules || []).join(', ') || 'none' }}
          </span>
        </li>
        <li class="flex items-center justify-between gap-3">
          <span class="font-medium">devMode</span>
          <span class="text-gray-500 dark:text-gray-400">{{
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
              class="w-5 h-5 rounded border border-gray-300 dark:border-gray-700"
              :style="{ backgroundColor: cfg.primaryColor }"
            />
            <span class="text-gray-500 dark:text-gray-400">{{
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
              class="w-5 h-5 rounded border border-gray-300 dark:border-gray-700"
              :style="{ backgroundColor: cfg.neutralColor }"
            />
            <span class="text-gray-500 dark:text-gray-400">{{
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
              class="w-5 h-5 rounded border border-gray-300 dark:border-gray-700"
              :style="{ backgroundColor: cfg.secondaryColor }"
            />
            <span class="text-gray-500 dark:text-gray-400">
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
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Server-side credentials detected via env or service-account file.
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

      <div class="space-y-3 text-sm text-gray-600 dark:text-gray-300">
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
            <span class="font-medium">Service-account file</span>
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
      <DevJsonPanel :data="{ runtime: cfg }" />
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useFireUXConfig } from '../../composables/fireux/app/FireUXConfig'
import { useAppEnvCheck } from '../../composables/fireux/app/utils/useAppEnvCheck'

definePageMeta({
  title: 'Development Tools',
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

const {
  data: envData,
  pending: envPending,
  refresh: refreshEnv,
} = await useAppEnvCheck()

const adminAuth = computed(() => envData.value?.server?.adminAuth ?? null)
const adminConfigured = computed(() => adminAuth.value?.configured ?? false)

const adminNotes = computed(() => {
  const notes = envData.value?.notes ?? []
  return notes.filter((note) => note.toLowerCase().includes('service account'))
})

const adminStatus = computed(() => {
  if (envPending.value) {
    return {
      color: 'info' as const,
      label: 'checking…',
      description: 'Validating Firebase Admin configuration…',
    }
  }

  if (adminConfigured.value) {
    let source = 'Detected via service-account file.'
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
      label: 'configured',
      description: source,
    }
  }

  return {
    color: 'warning' as const,
    label: 'missing',
    description:
      'Add FIREBASE_SERVICE_ACCOUNT JSON, split keys, or service-account.json under packages/ecosystem/<ecosystem>/config/.',
  }
})

const refreshEnvCheck = () => {
  void refreshEnv()
}

const copyRuntime = () => {
  if (typeof navigator === 'undefined' || !navigator.clipboard) return
  navigator.clipboard.writeText(JSON.stringify({ runtime: cfg }, null, 2))
}

const toggleRuntimeJson = () => {
  showRuntimeJson.value = !showRuntimeJson.value
}
</script>
