<script setup lang="ts">
import { computed } from 'vue'
import { useAppConfig, useRoute, useRuntimeConfig } from '#imports'

function safeStringify(value: unknown) {
  const seen = new WeakSet<object>()
  return JSON.stringify(
    value,
    (_key, val) => {
      if (typeof val === 'function') return `[Function ${val.name || 'anonymous'}]`
      if (typeof val === 'bigint') return val.toString()
      if (val && typeof val === 'object') {
        if (seen.has(val as object)) return '[Circular]'
        seen.add(val as object)
      }
      return val
    },
    2
  )
}

const runtimeConfig = useRuntimeConfig()
const appConfig = useAppConfig()
const route = useRoute()

const debug = computed(() => {
  return {
    route: {
      fullPath: route.fullPath,
      name: route.name,
      params: route.params,
      query: route.query,
    },
    // On the client, Nuxt only exposes runtimeConfig.public.
    runtimeConfig,
    appConfig,
  }
})

const debugJson = computed(() => safeStringify(debug.value))
</script>

<template>
  <div style="padding: 16px; font-family: ui-sans-serif, system-ui">
    <h1 style="margin: 0 0 8px">fireux-core sandbox</h1>
    <p style="margin: 0 0 16px">
      If you can see this, Nuxt + fireux-core booted.
    </p>

    <h2 style="margin: 0 0 8px">Config dump</h2>
    <p style="margin: 0 0 12px; opacity: 0.75">
      Note: in the browser, Nuxt only exposes <code>runtimeConfig.public</code>.
    </p>

    <pre
      style="
        padding: 12px;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        background: #fafafa;
        overflow: auto;
        max-height: 70vh;
      "
    ><code>{{ debugJson }}</code></pre>
  </div>
</template>
