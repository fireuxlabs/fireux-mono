<!-- FILE: packages/core/fireux-core/src/runtime/pages/apps/[id].vue -->
<template>
  <UPage>
    <UPageBody class="space-y-6">
      <UPageHeader
        :title="pageTitle"
        description="Firestore snapshot for this app."
      />

      <UCard class="fx-section">
        <template #header>
          <div class="fx-section__header">
            <div class="fx-section__copy">
              <h1 class="text-base font-semibold">{{ headerTitle }}</h1>
              <p class="text-xs text-gray-500">
                Inspect the normalized view for this app.
              </p>
            </div>
            <UBadge v-if="appId" variant="subtle">{{ appId }}</UBadge>
          </div>
        </template>

        <template v-if="isLoading">
          <USkeleton class="h-16 rounded-xl" />
          <USkeleton class="h-48 rounded-xl" />
        </template>

        <template v-else-if="currentApp">
          <MoleculesPill v-if="pill" v-bind="pill" />
          <OrganismsAppCardsCell :app="currentApp" :to="pill?.to ?? null" />
          <OrganismsAppCardsProfile v-if="profile" :app="profile" />
        </template>

        <p v-else class="fx-section__empty">App not found.</p>
      </UCard>

      <UCard class="fx-section">
        <template #header>
          <div class="fx-section__header">
            <div class="fx-section__copy">
              <h2 class="text-base font-semibold">Raw Document</h2>
              <p class="text-xs text-gray-500">Read-only snapshot.</p>
            </div>
          </div>
        </template>

        <div class="fx-section__item">
          <h3 class="fx-section__label">apps/{{ appId || '—' }}</h3>
          <div v-if="isLoading" class="space-y-2">
            <USkeleton class="h-6 w-40 rounded" />
            <USkeleton class="h-32 rounded-xl" />
          </div>
          <DevJsonPanel v-else-if="currentApp" :data="currentApp" />
          <p v-else class="fx-section__empty">No document loaded.</p>
        </div>
      </UCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useHead } from 'nuxt/app'
import { useRoute } from 'vue-router'
import { useAppFetch } from 'fireux-core/runtime/composables/firestore/core/app/main/useAppFetch.ts'
import { useAppInterface } from 'fireux-core/runtime/composables/firestore/core/app/main/useAppInterface.ts'

const route = useRoute()
const appId = Array.isArray(route.params.id)
  ? route.params.id[0] ?? ''
  : route.params.id?.toString() ?? ''

const { app } = useAppFetch(appId || null)
const { pillProps, profileProps } = useAppInterface(app)

const isLoading = computed(() => app.value === undefined)
const currentApp = computed(() =>
  app.value === undefined ? null : app.value ?? null
)

const pill = computed(() =>
  currentApp.value ? pillProps(currentApp.value) : null
)
const profile = computed(() =>
  currentApp.value ? profileProps(currentApp.value) : null
)

const headerTitle = computed(() => currentApp.value?.app_name ?? 'App Details')
const pageTitle = computed(() => currentApp.value?.app_name ?? 'App Details')

useHead({
  title: computed(() =>
    currentApp.value?.app_name
      ? `${currentApp.value.app_name} · App`
      : 'App Details'
  ),
})
</script>
