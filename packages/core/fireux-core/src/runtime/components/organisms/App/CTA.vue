<template>
  <UPageCTA title="App console" orientation="horizontal">
    <template #links>
      <div class="grid gap-3 sm:grid-cols-3">
        <section class="space-y-2">
          <p class="text-sm font-semibold">My Apps</p>
          <UButton
            block
            variant="subtle"
            color="primary"
            icon="i-lucide-app-window"
            @click="goToApp('live')"
          >
            Open my app
          </UButton>
        </section>

        <section class="space-y-2">
          <p class="text-sm font-semibold">Test Apps</p>
          <UButton
            block
            variant="subtle"
            color="primary"
            icon="i-lucide-flask-conical"
            @click="goToApp('test')"
          >
            Open test app
          </UButton>
        </section>

        <section class="space-y-2">
          <p class="text-sm font-semibold">Read-only Apps</p>
          <div v-if="readOnlyPills.length" class="space-y-2">
            <AppCardsPill
              v-for="item in readOnlyPills"
              :key="item.id"
              v-bind="item"
              :link="false"
              :action="true"
              :show-badges="false"
              class="cursor-pointer"
              @action="goToApp('read-only', item.id)"
            />
          </div>
          <p v-else class="text-sm text-dimmed">
            No read-only apps.
          </p>
        </section>
      </div>
    </template>

    <template #default>
      <img
        src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=640&h=520&q=80"
        width="640"
        height="520"
        alt="App operations"
        class="w-full rounded-lg object-cover"
        loading="lazy"
      />
    </template>
  </UPageCTA>
</template>

<script setup lang="ts">
import { useRouter } from '#imports'
import {
  getReadOnlyAppScenarioList,
} from '../../../composables/fireux/app/runtime-app/read-only-scenarios'
import type { RuntimeAppMode } from '../../../composables/fireux/app/runtime-app/shared'
import { useRuntimeAppSelection } from '../../../composables/fireux/app/runtime-app/state'
import { computed } from 'vue'

const router = useRouter()
const { runtimeAppId, setRuntimeApp } = useRuntimeAppSelection()

const readOnlyScenarios = computed(() =>
  getReadOnlyAppScenarioList()
    .map((entry) => ({
      id: String(entry.id || '').trim(),
      name: String(entry.name || '').trim(),
      subtitle: String(entry.manager_display_name || '').trim(),
      imageUrl: String(entry.manager_avatar_url || entry.image_url || '').trim(),
    }))
    .filter((entry) => Boolean(entry.id))
)

const readOnlyPills = computed(() =>
  readOnlyScenarios.value.map((entry) => ({
    id: entry.id,
    to: '',
    displayName: entry.name,
    ecosystem: entry.subtitle,
    thumbnailUrl: entry.imageUrl,
  }))
)

const runtimeConsolePath = computed(() =>
  router.getRoutes().some((route) => route.path === '/console')
    ? '/console'
    : '/'
)

const goToApp = async (mode: RuntimeAppMode, appId?: string) => {
  const fallback = String(runtimeAppId.value || '').trim()
  const resolvedId = String(appId || fallback).trim()
  setRuntimeApp({ appId: resolvedId, mode })
  await router.push(runtimeConsolePath.value)
}
</script>
