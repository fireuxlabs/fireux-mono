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
          <span class="text-gray-500 dark:text-gray-400">{{
            cfg.ecosystem || 'n/a'
          }}</span>
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
      </ul>
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
import { ref } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'

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
  },
})

const cfg = useFireUXConfig()
const showRuntimeJson = ref(false)

const copyRuntime = () => {
  if (typeof navigator === 'undefined' || !navigator.clipboard) return
  navigator.clipboard.writeText(JSON.stringify({ runtime: cfg }, null, 2))
}

const toggleRuntimeJson = () => {
  showRuntimeJson.value = !showRuntimeJson.value
}
</script>
