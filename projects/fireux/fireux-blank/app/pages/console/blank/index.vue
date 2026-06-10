<template>
  <UPage>
    <UPageHeader
      class="pageheader"
      title="Blank Console"
      description="A clean console family with live targets, no demo mode, no test mode, and no child operations."
    >
      <template #links>
        <UButton
          to="/console/blank/create"
          icon="i-lucide-plus"
          color="primary"
        >
          Create Blank
        </UButton>
      </template>
    </UPageHeader>

    <UPageBody class="pagebody">
      <UPageCard
        v-if="blank.pending.value"
        title="Loading Blank targets"
        description="Checking the app-scoped Blank console targets."
        variant="subtle"
      />

      <UPageCard
        v-else-if="!blank.hasLiveTargets.value"
        title="No live Blank targets"
        description="Create the first Blank target to test the root console lifecycle."
        variant="subtle"
      >
        <template #footer>
          <UButton
            to="/console/blank/create"
            icon="i-lucide-plus"
            color="primary"
          >
            Create Blank
          </UButton>
        </template>
      </UPageCard>

      <div v-else class="grid gap-3 md:grid-cols-2">
        <UPageCard
          v-for="target in blank.liveTargets.value"
          :key="target.id"
          :title="target.name || target.id"
          :description="target.id"
          variant="subtle"
        >
          <template #footer>
            <UBadge color="neutral" variant="soft">
              {{ target.status }}
            </UBadge>
          </template>
        </UPageCard>
      </div>

      <UPageCard variant="subtle">
        <template #header>
          <div>
            <h2 class="text-base font-semibold">Console spine contract</h2>
            <p class="text-sm text-dimmed">
              This page proves the console route can be mounted without domain wiring.
            </p>
          </div>
        </template>

        <div class="grid gap-3 sm:grid-cols-2">
          <UAlert
            title="No demo"
            description="Blank does not expose demo targets."
            icon="i-lucide-ban"
            color="neutral"
            variant="soft"
          />
          <UAlert
            title="No test"
            description="Blank does not auto-create or read test records."
            icon="i-lucide-flask-conical-off"
            color="neutral"
            variant="soft"
          />
          <UAlert
            title="No operations"
            description="Blank has no selected-workspace child actions."
            icon="i-lucide-list-x"
            color="neutral"
            variant="soft"
          />
          <UAlert
            title="Live create only"
            description="Blank creates real root targets and app console scopes."
            icon="i-lucide-database"
            color="neutral"
            variant="soft"
          />
        </div>
      </UPageCard>

      <DevJson
        v-if="isDev"
        title="Blank console debug"
        context="fireux-blank · /console/blank"
        :data="debug"
        :default-open="false"
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useBlankConsole } from '../../../composables/fireux/console/blank/useBlankConsole'

definePageMeta({
  layout: 'console',
  name: 'BlankConsoleIndexPage',
  nav: {
    key: 'console-blank',
    label: 'Blank',
    icon: 'i-lucide-square-dashed',
    order: 10,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
})

const blank = useBlankConsole()
const isDev = import.meta.dev
const debug = computed(() => ({
  family: 'blank',
  pending: blank.pending.value,
  liveCount: blank.liveTargets.value.length,
  hasLiveTargets: blank.hasLiveTargets.value,
  rootCollectionPath: blank.rootCollectionPath,
  appCollectionPath: blank.appCollectionPath.value,
  modes: [],
  operations: [],
}))

useSeoMeta({
  title: 'Blank Console',
  description:
    'A clean console family with live targets, no demo mode, no test mode, and no child operations.',
  robots: 'noindex, nofollow',
})
</script>
