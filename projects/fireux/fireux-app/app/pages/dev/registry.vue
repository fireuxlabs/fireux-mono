<!-- Concurrent edit — 2026-07-20 23:34 CEST — Final app CSS pass: semantic colors. -->
<template>
  <UPage>
    <UPageHeader
      title="Dev · Directory Snapshot"
      description="Inspect the allowlisted public App and Ecosystem directory projection."
    />

    <UPageBody class="pagebody">
      <UCard>
        <template #header>
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p
                class="text-xs font-semibold uppercase tracking-wide text-muted"
              >
                Directory utilities
              </p>
              <h2
                class="text-lg font-semibold text-highlighted"
              >
                Copy projected JSON
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
          Uses <code>/api/directory</code>. The legacy Firestore registry
          API is retired because it mixed package metadata with entity copies.
          For the authority notes, visit
          <NuxtLink
            class="text-primary hover:underline"
            to="/developer/registry"
          >
            Developer · Directory Docs
          </NuxtLink>
          for the narrative workflow.
        </p>

        <div
          v-if="error"
          class="mt-4 rounded-lg border border-error/40 bg-error/10 p-4 text-sm text-error"
        >
          <p class="font-semibold text-error">
            Unable to load directory data.
          </p>
          <p v-text="errorMessage"></p>
        </div>
        <div
          v-else-if="pending"
          class="mt-4 flex items-center gap-3 rounded-lg border border-dashed border-default p-4 text-sm text-muted"
        >
          <Icon
            name="eos-icons:bubble-loading"
            class="text-lg text-primary"
            aria-hidden="true"
          />
          <span>Loading directory snapshot…</span>
        </div>
        <DevDebugPanelPanel
          launcher
          include-route
          v-else-if="snapshot"
          class="mt-4"
          title="Directory JSON"
          context="public directory projection"
          :data="snapshot"
          :default-open="true"
        />
        <p v-else class="mt-4 text-sm text-muted">
          No public directory entries are available.
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

type DirectoryResponse = {
  ok: boolean
  generatedAt: string | null
  apps: unknown[]
  ecosystems: unknown[]
}

const { data, pending, error, refresh } = await useFetch<DirectoryResponse>(
  '/api/directory',
  {
  server: true,
  default: () => ({
    ok: false,
    generatedAt: null,
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
  title: 'FireUX Directory Snapshot',
  description:
    'Inspect the allowlisted FireUX App and Ecosystem directory projection.',
})

definePageMeta({
  layout: 'dev',
  title: 'Dev · Directory',
  nav: {
    key: 'dev-fireux-registry',
    label: 'Directory Snapshot',
    icon: 'i-lucide-database',
    desktop: true,
    group: 'core',
    order: 96,
    layouts: ['dev'],
  },
})
</script>
