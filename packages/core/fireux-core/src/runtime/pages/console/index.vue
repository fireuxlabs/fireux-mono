<template>
  <div class="min-h-screen bg-elevated/50">
    <div class="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <div class="flex min-h-11 items-center">
        <AppBrandWordmark
          size="card"
          :alt="appName"
        />
      </div>

      <UPageCard variant="subtle">
        <div class="space-y-4">
          <div class="space-y-1">
            <p class="text-sm font-medium text-highlighted">Console</p>
            <p class="text-sm text-dimmed">
              Choose a console family for {{ appName }}.
            </p>
          </div>

          <div v-if="families.length" class="grid gap-2">
            <UButton
              v-for="family in families"
              :key="family.key"
              :to="family.path"
              color="neutral"
              variant="soft"
              class="justify-between"
            >
              <span class="flex items-center gap-2">
                <UIcon :name="family.icon" class="size-4" />
                <span>{{ family.label }}</span>
              </span>

              <UIcon name="i-lucide-arrow-right" class="size-4" />
            </UButton>
          </div>

          <UAlert
            v-else
            color="neutral"
            variant="soft"
            title="No console families"
            description="This app does not currently expose any console families."
          />
        </div>
      </UPageCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFireUXConfig } from '../../composables/fireux/app/FireUXConfig'
import { toConsoleFamilyLabel } from '../../composables/fireux/app/routing/consoleRoutes'
import { useConsoleEntryCta } from '../../composables/fireux/app/routing/useConsoleEntryCta'

definePageMeta({
  layout: 'console',
  consoleEntry: true,
  requiresAuth: true,
})

const { appName } = useFireUXConfig()
const { consoleFamilies } = useConsoleEntryCta()

const families = computed(() =>
  consoleFamilies.value.map((family) => ({
    ...family,
    label: toConsoleFamilyLabel(family.key),
    icon: 'i-lucide-layout-panel-left',
  }))
)
</script>
