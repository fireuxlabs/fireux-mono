<!-- FILE: packages/core/fireux-core/src/runtime/pages/dev/apps.vue -->
<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <h1 class="text-base font-semibold">Current App</h1>
        <UButton
          v-if="app"
          size="xs"
          variant="ghost"
          icon="i-lucide-copy"
          @click="copyJSON(app)"
        >
          Copy JSON
        </UButton>
      </div>
    </template>

    <div v-if="app" class="space-y-4">
      <MoleculesPill v-bind="pillProps(app)" />

      <OrganismsAppCardsCell :app="app" :to="pillProps(app).to" />
      <OrganismsAppCardsProfile :app="app" />

      <div
        class="rounded-md border border-slate-200/60 bg-slate-50/40 p-3 text-xs text-slate-600 dark:border-slate-700/60 dark:bg-slate-900/40 dark:text-slate-300"
      >
        <p class="mb-2 font-medium text-slate-700 dark:text-slate-200">
          Computed flags
        </p>
        <ul class="space-y-1">
          <li><strong>isLoading:</strong> {{ isLoading }}</li>
          <li><strong>isInitialized:</strong> {{ isInitialized }}</li>
        </ul>
      </div>

      <div
        class="rounded-md border border-slate-200/60 bg-slate-50/40 p-3 text-xs text-slate-600 dark:border-slate-700/60 dark:bg-slate-900/40 dark:text-slate-300"
      >
        <p class="mb-2 font-medium text-slate-700 dark:text-slate-200">
          App users subcollection
        </p>
        <div v-if="appUsers?.length" class="space-y-3">
          <div class="flex flex-wrap gap-2">
            <MoleculesPill
              v-for="(entry, index) in appUsers || []"
              :key="entry.appUser?.id ?? index"
              :avatar="entry?.avatar ?? null"
              :initials="
                (
                  (entry?.display_name ?? entry?.appUser?.id ?? 'U')[0] ?? 'U'
                ).toUpperCase()
              "
              :title="entry?.display_name ?? entry?.appUser?.id ?? 'User'"
              :subtitle="entry?.appUser?.role ?? 'user'"
              :badges="entry?.appUser?.role === 'admin' ? ['admin'] : undefined"
              :to="entry?.id ? `/users/${entry.id}` : '#'"
            />
          </div>

          <DevJsonPanel :data="appUsers" />
        </div>

        <p v-else class="text-xs text-gray-500 dark:text-gray-400">
          No app users found.
        </p>
      </div>

      <DevJsonPanel :data="app" class="mt-4" />
    </div>

    <p v-else class="text-sm text-gray-500">
      No app resolved for this runtime.
    </p>
  </UCard>

  <UCard class="mt-6">
    <template #header>
      <h2 class="text-sm font-semibold text-slate-700 dark:text-slate-200">
        Apps collection
      </h2>
    </template>

    <div class="space-y-3 text-xs text-slate-600 dark:text-slate-300">
      <div v-if="apps?.length" class="space-y-3">
        <div class="flex flex-wrap gap-2">
          <MoleculesPill
            v-for="(entry, index) in apps || []"
            :key="entry.id ?? index"
            v-bind="pillProps(entry)"
          />
        </div>

        <DevJsonPanel :data="apps" />
      </div>

      <p v-else class="text-xs text-gray-500 dark:text-gray-400">
        No apps found in collection.
      </p>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { useApp } from 'fireux-core/runtime/composables/firestore/core/app/useApp.ts'
import { useAppCollection } from 'fireux-core/runtime/composables/firestore/core/app/main/useAppCollection.ts'
import { useDevClipboard } from '../../composables/dev/useDevClipboard.ts'

definePageMeta({
  layout: 'dev',
  alias: ['/dev/apps'],
  nav: {
    key: 'dev-apps',
    label: 'Apps',
    icon: 'i-lucide-app-window',
    desktop: true,
    group: 'core',
    layouts: ['dev'],
  },
})

const { app, appUsers, isLoading, isInitialized, pillProps } = useApp()
const { apps } = useAppCollection()
const { copyJSON } = useDevClipboard()
</script>
