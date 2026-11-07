<!-- Concurrent edit — 2026-07-20 23:34 CEST — Final app CSS pass: semantic colors. -->
<template>
  <UPage>
    <UPageHeader
      title="Diagnostics · Directory Snapshot"
      description="Inspect the allowlisted public App and Ecosystem directory projection."
    />

    <UPageBody class="pagebody">
      <UCard>
        <template #header>
          <div class="card__header">
            <div>
              <p class="fx-type-caption">Directory utilities</p>
              <h2 class="fx-type-section-title">Copy projected JSON</h2>
            </div>
            <div class="fx-card__actions">
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

        <p class="fx-type-caption">
          Uses <code>/api/directory</code>. The legacy Firestore registry API is
          retired because it mixed package metadata with entity copies. For the
          authority notes, visit
          <ULink to="/developer/registry"> Developer · Directory Docs </ULink>
          for the narrative workflow.
        </p>

        <UAlert
          v-if="error"
          color="error"
          title="Unable to load directory data."
          :description="errorMessage"
        />
        <UCard v-else-if="pending">
          <Icon name="eos-icons:bubble-loading" aria-hidden="true" />
          <span>Loading directory snapshot…</span>
        </UCard>
        <DiagnosticsDebugPanelPanel
          launcher
          include-route
          v-else-if="snapshot"
          title="Directory JSON"
          context="public directory projection"
          :data="snapshot"
          :default-open="true"
        />
        <p v-else class="fx-type-caption">
          No public directory entries are available.
        </p>

        <template #footer>
          <div>
            <span>Last generated:</span>
            <span v-if="generatedAtText" v-text="generatedAtText"></span>
            <span v-else>unknown</span>
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
  layout: 'diagnostics',
  title: 'Diagnostics · Directory',
  nav: {
    key: 'dev-fireux-registry',
    label: 'Directory Snapshot',
    icon: 'i-lucide-database',
    desktop: true,
    group: 'core',
    order: 96,
    layouts: ['diagnostics'],
  },
})
</script>
