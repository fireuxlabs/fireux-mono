<template>
  <section class="space-y-3">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <div>
        <p class="text-sm font-medium text-gray-900 dark:text-gray-100">
          {{ title }}
        </p>
        <p class="text-xs text-gray-500 dark:text-gray-400">
          Raw Firestore payloads (left) versus enriched entries (right).
        </p>
      </div>
      <UBadge
        variant="soft"
        :class="issueRows.length
          ? 'bg-amber-100 text-amber-800 dark:bg-amber-400/10 dark:text-amber-200'
          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-200'"
      >
        <span v-if="issueRows.length">
          {{ issueRows.length }} flagged
        </span>
        <span v-else>All clear</span>
      </UBadge>
    </div>

    <p v-if="!rows.length" class="text-sm text-gray-500 dark:text-gray-400">
      {{ emptyText }}
    </p>

    <div v-else class="space-y-4">
      <article
        v-for="row in rows"
        :key="row.id"
        class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900/40"
      >
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="min-w-0 flex-1">
            <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {{ row.id || 'Unknown profile' }}
            </p>
            <ul
              v-if="row.issues.length"
              class="mt-1 list-disc space-y-0.5 pl-4 text-xs text-amber-700 dark:text-amber-200"
            >
              <li v-for="issue in row.issues" :key="issue">
                {{ issue }}
              </li>
            </ul>
            <p
              v-else
              class="mt-1 text-xs text-gray-500 dark:text-gray-400"
            >
              Matches current model
            </p>
          </div>

          <UBadge
            variant="soft"
            :class="row.issues.length
              ? 'bg-amber-100 text-amber-800 dark:bg-amber-400/10 dark:text-amber-200'
              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-200'"
          >
            <span v-if="row.issues.length">
              {{ row.issues.length }} issue{{ row.issues.length === 1 ? '' : 's' }}
            </span>
            <span v-else>OK</span>
          </UBadge>

          <div class="flex flex-wrap gap-2">
            <UButton
              icon="i-heroicons-clipboard-document"
              size="xs"
              variant="outline"
              :disabled="copying"
              @click="() => copyRaw(row)"
            >
              Copy raw
            </UButton>
            <UButton
              icon="i-heroicons-clipboard-document-check"
              size="xs"
              variant="outline"
              :disabled="copying"
              @click="() => copyEnriched(row)"
            >
              Copy enriched
            </UButton>
          </div>
        </div>

        <div class="grid gap-3 md:grid-cols-2">
          <div>
            <p class="text-xs font-medium text-gray-500 dark:text-gray-400">
              Raw document
            </p>
            <pre class="diff-pre">{{ stringify(row.raw) }}</pre>
          </div>
          <div>
            <p class="text-xs font-medium text-gray-500 dark:text-gray-400">
              Enriched payload
            </p>
            <pre class="diff-pre">{{ stringify(row.enriched) }}</pre>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDevClipboard } from '../../composables/dev/useDevClipboard'

defineOptions({ name: 'DevProfileDiffList' })

interface ProfileDiffDisplayRow {
  id: string
  raw: unknown
  enriched: unknown
  issues: string[]
}

interface Props {
  rows: ProfileDiffDisplayRow[]
  title?: string
  emptyText?: string
}

const props = withDefaults(defineProps<Props>(), {
  rows: () => [],
  title: 'Raw vs enriched',
  emptyText: 'No profiles loaded yet.',
})

const issueRows = computed(() =>
  props.rows.filter((row) => Array.isArray(row.issues) && row.issues.length)
)

const stringify = (value: unknown) => {
  try {
    if (value === undefined) return 'undefined'
    if (typeof value === 'string') return value
    return JSON.stringify(value, null, 2) ?? 'null'
  } catch (error) {
    console.error('DevProfileDiffList: failed to stringify value', error)
    return '[unserializable]'
  }
}

const { copyJSON, copying } = useDevClipboard()

const copyRaw = async (row: ProfileDiffDisplayRow) => {
  await copyJSON(row.raw, {
    label: `${row.id || 'profile'} raw document`,
  })
}

const copyEnriched = async (row: ProfileDiffDisplayRow) => {
  await copyJSON(row.enriched, {
    label: `${row.id || 'profile'} enriched payload`,
  })
}
</script>

<style scoped>
.diff-pre {
  margin-top: 0.5rem;
  max-height: 15rem;
  overflow: auto;
  border-radius: 0.5rem;
  background-color: rgba(15, 23, 42, 0.04);
  padding: 0.75rem;
  font-size: 0.75rem;
  line-height: 1rem;
}
:global(.dark) .diff-pre {
  background-color: rgba(255, 255, 255, 0.05);
}
</style>
