<template>
  <div class="registry-dev">
    <header>
      <p class="eyebrow">Dev Utilities</p>
      <h1>FireUX Registry Snapshot</h1>
      <p>
        Fetch every registry document (modules, apps, ecosystems) so internal
        teams can copy the payload into tools, tests, or external dashboards.
      </p>
      <div class="actions">
        <button type="button" @click="refresh" :disabled="pending">
          {{ pending ? 'Refreshing…' : 'Refresh data' }}
        </button>
        <button
          type="button"
          class="copy"
          @click="copyJson"
          :disabled="!jsonString"
        >
          {{ copied ? 'Copied!' : 'Copy JSON' }}
        </button>
      </div>
    </header>

    <section class="panel">
      <div v-if="error" class="state state-error">
        <p>Unable to load registry data.</p>
        <p class="hint">
          {{ error.message || 'See server logs for details.' }}
        </p>
      </div>
      <div v-else-if="pending" class="state">
        <Icon name="eos-icons:bubble-loading" class="spinner" />
        <p>Loading registry snapshot…</p>
      </div>
      <pre v-else class="json-dump">{{ jsonString }}</pre>
    </section>
  </div>
</template>

<script setup lang="ts">
const { data, pending, error, refresh } = await useFetch('/api/registry', {
  server: true,
  default: () => ({ ok: false, modules: [], apps: [], ecosystems: [] }),
})

const copied = ref(false)

const jsonString = computed(() => {
  if (!data.value || !data.value.ok) return ''
  return JSON.stringify(data.value, null, 2)
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
  nav: {
    key: 'dev-registry',
    label: 'Registry JSON',
    icon: 'i-lucide-database',
    desktop: false,
    mobile: false,
    section: 'dev-tools',
  },
})
</script>

<style scoped>
.registry-dev {
  max-width: 960px;
  margin: 0 auto;
  padding: 3rem 1.5rem 4rem;
  display: grid;
  gap: 1.5rem;
}
.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.3em;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
}
header h1 {
  font-size: clamp(2rem, 4vw, 3rem);
  margin-bottom: 0.5rem;
}
header p {
  max-width: 60ch;
}
.actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-top: 1.25rem;
}
button {
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.05);
  color: #f8fafc;
  padding: 0.6rem 1.5rem;
  border-radius: 999px;
  font-weight: 600;
  transition: background 0.2s ease;
}
button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
button:not(:disabled):hover {
  background: rgba(255, 255, 255, 0.12);
}
button.copy {
  border-color: rgba(99, 102, 241, 0.5);
  background: rgba(99, 102, 241, 0.15);
}
.panel {
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 1rem;
  background: rgba(5, 6, 10, 0.8);
  min-height: 320px;
  overflow: hidden;
}
.json-dump {
  margin: 0;
  padding: 1.5rem;
  font-family: 'JetBrains Mono', SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.9rem;
  line-height: 1.4;
  color: #e0f2fe;
  background: transparent;
  overflow: auto;
  white-space: pre;
}
.state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem;
  gap: 0.5rem;
  color: #cbd5f5;
}
.state-error {
  color: #fda4af;
}
.spinner {
  font-size: 2rem;
  color: #93c5fd;
}
</style>
