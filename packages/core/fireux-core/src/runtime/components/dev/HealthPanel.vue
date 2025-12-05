<template>
  <section class="space-y-4">
    <header class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {{ title }}
        </p>
        <p class="text-xs text-gray-500 dark:text-gray-400">
          {{ description }}
        </p>
      </div>
      <UBadge :color="overallColor" variant="soft">
        <span v-if="overallStatus === 'pass'">All checks passing</span>
        <span v-else-if="overallStatus === 'warn'">Issues detected</span>
        <span v-else>Action required</span>
      </UBadge>
    </header>

    <p v-if="!checks.length" class="text-sm text-gray-500 dark:text-gray-400">
      No health checks available yet.
    </p>

    <div v-else class="space-y-4">
      <UCard v-for="check in checks" :key="check.id" class="space-y-3">
        <template #header>
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <span
                  class="text-base font-semibold text-gray-900 dark:text-gray-100"
                >
                  {{ check.label }}
                </span>
                <UBadge :color="resolveColor(check.status)" variant="soft">
                  {{ statusLabel(check.status) }}
                </UBadge>
              </div>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                {{ check.description }}
              </p>
            </div>
            <div class="text-right text-xs text-gray-500 dark:text-gray-400">
              <p>{{ check.summary }}</p>
              <p v-if="check.stats" class="mt-1 font-mono">
                {{ formatStats(check.stats) }}
              </p>
            </div>
          </div>
        </template>

        <div v-if="check.issues.length" class="space-y-3">
          <article
            v-for="issue in check.issues"
            :key="issue.id"
            class="rounded-lg border border-gray-200 p-3 dark:border-gray-800"
          >
            <div class="flex flex-wrap items-center justify-between gap-2">
              <p class="text-sm font-medium text-gray-900 dark:text-gray-100">
                {{ issue.message }}
              </p>
              <UBadge :color="issueColor(issue.severity)" variant="soft">
                {{ issueLabel(issue.severity) }}
              </UBadge>
            </div>
            <p
              v-if="issue.hint"
              class="text-xs text-gray-500 dark:text-gray-400"
            >
              {{ issue.hint }}
            </p>
          </article>
        </div>
        <p v-else class="text-sm text-gray-500 dark:text-gray-400">
          No issues detected for this check.
        </p>
      </UCard>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type {
  DevHealthResult,
  DevHealthStatus,
} from '../../composables/core/dev/health/types'

defineOptions({ name: 'DevHealthPanel' })

interface Props {
  title?: string
  description?: string
  checks?: DevHealthResult[]
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Health checks',
  description: 'Live integrity checks for the current stack.',
  checks: () => [],
})

const overallStatus = computed<DevHealthStatus>(() => {
  if (!props.checks.length) return 'pass'
  if (props.checks.some((check) => check.status === 'fail')) return 'fail'
  if (props.checks.some((check) => check.status === 'warn')) return 'warn'
  return 'pass'
})

const overallColor = computed(() => resolveColor(overallStatus.value))

const statusLabel = (status: DevHealthStatus) => {
  if (status === 'pass') return 'pass'
  if (status === 'warn') return 'needs attention'
  return 'needs fix'
}

const resolveColor = (status: DevHealthStatus) => {
  switch (status) {
    case 'pass':
      return 'success'
    case 'warn':
      return 'warning'
    case 'fail':
      return 'error'
    default:
      return 'info'
  }
}

const issueLabel = (severity?: string) => {
  if (severity === 'error') return 'error'
  if (severity === 'warning') return 'warning'
  return 'info'
}

const issueColor = (severity?: string) => {
  if (severity === 'error') return 'error'
  if (severity === 'warning') return 'warning'
  return 'info'
}

const formatStats = (stats: Record<string, number>) =>
  Object.entries(stats)
    .map(([key, value]) => `${key}: ${value}`)
    .join(' · ')
</script>
