<template>
  <UPage>
    <UPageHeader
      title="Dev · Registry Snapshot"
      description="Copy modules, apps, and ecosystems directly from the Firestore registry collections."
    />

    <UPageBody class="space-y-6">
      <UCard>
        <template #header>
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="flex flex-col">
              <h2 class="text-base font-semibold text-gray-900 dark:text-gray-100">
                Full registry payload
              </h2>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Returns the same JSON consumed by scripts, seed jobs, and parity dashboards.
              </p>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <UButton
                size="sm"
                variant="soft"
                icon="i-lucide-refresh-ccw"
                :loading="pending"
                @click="refresh"
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

        <p class="mb-4 text-sm text-gray-500 dark:text-gray-400">
          Need the narrative playbook? See
          <NuxtLink class="text-primary-500 hover:underline" to="/developer/registry">
            Developer · Registry Docs
          </NuxtLink>
          for workflows, while this page stays JSON-first.
        </p>

        <div
          v-if="error"
          class="rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200"
        >
          <p class="font-semibold text-red-100">Unable to load registry data.</p>
          <p>{{ error.message || 'Check server logs for details.' }}</p>
        </div>
        <div
          v-else-if="pending"
          class="flex items-center gap-3 rounded-lg border border-dashed border-gray-200 p-4 text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400"
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
          title="Registry JSON"
          :data="snapshot"
          :default-open="true"
        />
        <p v-else class="text-sm text-gray-500 dark:text-gray-400">
          No registry data available yet. Run <code>pnpm registry:backfill</code> or
          <code>pnpm registry:register</code> to seed Firestore.
        </p>

        <template #footer>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            Source: <code>/api/registry</code>. Last generated:
            <span v-if="generatedAtText">{{ generatedAtText }}</span>
            <span v-else>unknown</span>.
          </p>
        </template>
      </UCard>

      <UCard>
        <template #header>
          <div class="flex items-center justify-between gap-2">
            <div class="flex flex-col">
              <h2 class="text-base font-semibold text-gray-900 dark:text-gray-100">
                Collection totals
              </h2>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Quick-glance counts from the current snapshot.
              </p>
            </div>
            <UBadge variant="soft">JSON-first</UBadge>
          </div>
        </template>

        <dl class="grid gap-4 sm:grid-cols-3">
          <div class="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
            <dt class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Modules
            </dt>
            <dd class="mt-2 text-3xl font-semibold text-gray-900 dark:text-gray-100">
              {{ summary.modules }}
            </dd>
            <p class="text-xs text-gray-500 dark:text-gray-400">packages/*/registry.json</p>
          </div>
          <div class="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
            <dt class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Apps
            </dt>
            <dd class="mt-2 text-3xl font-semibold text-gray-900 dark:text-gray-100">
              {{ summary.apps }}
            </dd>
            <p class="text-xs text-gray-500 dark:text-gray-400">projects/*/registry.json</p>
          </div>
          <div class="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
            <dt class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Ecosystems
            </dt>
            <dd class="mt-2 text-3xl font-semibold text-gray-900 dark:text-gray-100">
              {{ summary.ecosystems }}
            </dd>
            <p class="text-xs text-gray-500 dark:text-gray-400">packages/ecosystem/*/registry.json</p>
          </div>
        </dl>
      </UCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import DevJsonPanel from 'fireux-core/runtime/components/dev/JsonPanel.vue'

const { data, pending, error, refresh } = await useFetch('/api/registry', {
  server: true,
  default: () => ({
    ok: false,
    generatedAt: null,
    modules: [],
    apps: [],
    ecosystems: [],
  }),
})

const copied = ref(false)

const snapshot = computed(() => (data.value && data.value.ok ? data.value : null))

const jsonString = computed(() => {
  if (!snapshot.value) return ''
  return JSON.stringify(snapshot.value, null, 2)
})

const summary = computed(() => {
  const snap = snapshot.value
  if (!snap) {
    return { modules: 0, apps: 0, ecosystems: 0 }
  }
  const toTotal = (value: unknown) => (Array.isArray(value) ? value.length : 0)
  return {
    modules: toTotal(snap.modules),
    apps: toTotal(snap.apps),
    ecosystems: toTotal(snap.ecosystems),
  }
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

