<template>
  <UPage>
    <UPageHeader
      class="pageheader"
      title="Blank Console"
      description="A clean console family with no targets, modes, operations, or child records."
    />

    <UPageBody class="pagebody">
      <UPageCard
        title="No live Blank targets"
        description="This is the expected empty state. Blank does not fetch records or create console targets."
        variant="subtle"
      />

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
            title="No collection"
            description="Blank is a harness route, not a stored entity family."
            icon="i-lucide-database-zap"
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
  modes: [],
  operations: [],
}))

useSeoMeta({
  title: 'Blank Console',
  description:
    'A clean console family with no targets, modes, operations, or child records.',
  robots: 'noindex, nofollow',
})
</script>
