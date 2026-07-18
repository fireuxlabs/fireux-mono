<template>
  <UPage>
    <UPageHeader
      title="Dev · Registry Snapshot"
      description="Copy modules, apps, and ecosystems directly from the Firestore registry collections."
    />

    <UPageBody class="pagebody">
      <UCard>
        <template #header>
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p
                class="text-xs font-semibold uppercase tracking-wide text-muted"
              >
                Registry utilities
              </p>
              <h2
                class="text-lg font-semibold text-gray-900 dark:text-gray-100"
              >
                Copy JSON from Firestore
              </h2>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <UButton
                size="sm"
                variant="soft"
                icon="i-lucide-refresh-ccw"
                :loading="pending"
                @click="() => refresh()"
              >
                Refresh
              </UButton>
              <UButton
                size="sm"
                color="primary"
                icon="i-lucide-copy"
                :disabled="pending || !jsonString"
                @click="copyJson"
              >
                {{ copied ? 'Copied' : 'Copy JSON' }}
              </UButton>
            </div>
          </div>
        </template>

        <p class="text-sm text-muted">
          Uses the <code>/api/registry</code> endpoint that powers scripts like
          <code>pnpm registry:backfill</code>. Need documentation instead of
          payloads? Visit
          <NuxtLink
            class="text-primary-500 hover:underline"
            to="/developer/registry"
          >
            Developer · Registry Docs
          </NuxtLink>
          for the narrative workflow.
        </p>

        <div
          v-if="error"
          class="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200"
        >
          <p class="font-semibold text-red-100">
            Unable to load registry data.
          </p>
          <p v-text="errorMessage"></p>
        </div>
        <div
          v-else-if="pending"
          class="mt-4 flex items-center gap-3 rounded-lg border border-dashed border-gray-200 p-4 text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400"
        >
          <Icon
            name="eos-icons:bubble-loading"
            class="text-lg text-primary-500"
            aria-hidden="true"
          />
          <span>Loading registry snapshot…</span>
        </div>
        <DevJsonPanel
          v-else-if="snapshot"
          class="mt-4"
          title="Registry JSON"
          context="dev registry"
          :data="snapshot"
          :default-open="true"
        />
        <p v-else class="mt-4 text-sm text-muted">
          No registry data available. Run
          <code>pnpm registry:backfill</code>
          or
          <code>pnpm registry:register</code>
          to seed Firestore.
        </p>

        <template #footer>
          <div class="text-xs text-muted">
            <span>Last generated:</span>
            <span
              v-if="generatedAtText"
              class="ml-1"
              v-text="generatedAtText"
            ></span>
            <span v-else class="ml-1">unknown</span>
          </div>
        </template>
      </UCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useFetch } from 'nuxt/app'
import { computed, ref, watch } from 'vue'

type RegistryResponse = {
  ok: boolean
  generatedAt: string | null
  modules: unknown[]
  apps: unknown[]
  ecosystems: unknown[]
}

const { data, pending, error, refresh } = await useFetch<RegistryResponse>(
  '/api/registry',
  {
  server: true,
  default: () => ({
    ok: false,
    generatedAt: null,
    modules: [],
    apps: [],
    ecosystems: [],
  }),
  }
)

const copied = ref(false)

const snapshot = computed(() =>
  data.value && data.value.ok ? data.value : null
)

const jsonString = computed(() => {
  if (!snapshot.value) return ''
  return JSON.stringify(snapshot.value, null, 2)
})

const generatedAt = computed(() => snapshot.value?.generatedAt ?? null)

const generatedAtText = computed(() => {
  if (!generatedAt.value) return null
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(generatedAt.value))
  } catch {
    return generatedAt.value
  }
})

const errorMessage = computed(() => {
  const message = error.value?.message
  if (typeof message === 'string' && message.trim().length > 0) {
    return message
  }
  return 'Check server logs for details.'
})

watch(
  () => jsonString.value,
  () => {
    copied.value = false
  }
)

async function copyJson() {
  if (!jsonString.value) return
  try {
    await navigator.clipboard.writeText(jsonString.value)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (clipboardError) {
    console.error('clipboard write failed', clipboardError)
  }
}

useSeoMeta({
  title: 'FireUX Registry Snapshot',
  description:
    'Copy every registry document (apps, modules, ecosystems) as JSON.',
})

definePageMeta({
  layout: 'dev',
  title: 'Dev · Registry',
  nav: {
    key: 'dev-fireux-registry',
    label: 'Registry Snapshot',
    icon: 'i-lucide-database',
    desktop: true,
    group: 'core',
    order: 96,
    layouts: ['dev'],
  },
})
</script>
