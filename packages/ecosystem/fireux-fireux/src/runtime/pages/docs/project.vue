<template>
  <UPage v-if="page">
    <UPageHeader
      :title="page.title"
      :description="page.description"
      headline="Project Canon"
    />

    <UPageBody class="pagebody space-y-6">
      <ContentRenderer :value="page" />

      <UCard>
        <template #header>
          <div class="space-y-1">
            <h2 class="text-lg font-semibold">Objects In Scope</h2>
            <p class="text-sm text-dimmed">
              This list comes from the project docs page and acts as the first
              draft contract.
            </p>
          </div>
        </template>

        <div class="space-y-4">
          <ul class="grid gap-2 sm:grid-cols-3">
            <li
              v-for="objectName in projectObjects"
              :key="objectName"
              class="rounded-lg border border-default px-3 py-2 text-sm font-medium"
            >
              {{ objectName }}
            </li>
          </ul>

          <div class="flex flex-wrap items-center gap-3">
            <UButton
              color="primary"
              icon="i-lucide-shield-check"
              :loading="pending"
              @click="runDraftCheck"
            >
              Run Draft Check
            </UButton>

            <p class="text-xs text-dimmed">
              Runs the local project draft checker script through the app
              server.
            </p>
          </div>

          <UAlert
            v-if="result"
            :color="result.ok ? 'success' : 'warning'"
            variant="soft"
            :title="
              result.ok
                ? 'Project draft check passed'
                : 'Project draft check found drift'
            "
            :description="resultSummary"
          />

          <UAlert
            v-if="errorMessage"
            color="error"
            variant="soft"
            title="Project draft check failed"
            :description="errorMessage"
          />

          <div v-if="result?.checks?.length" class="grid gap-3">
            <div
              v-for="check in result.checks"
              :key="check.key"
              class="rounded-lg border border-default px-3 py-3"
            >
              <div class="flex items-center justify-between gap-3">
                <p class="text-sm font-medium">{{ check.label }}</p>
                <UBadge
                  :color="check.ok ? 'success' : 'warning'"
                  variant="soft"
                >
                  {{ check.ok ? 'ok' : 'drift' }}
                </UBadge>
              </div>
              <p class="mt-1 text-xs text-dimmed">{{ check.detail }}</p>
            </div>
          </div>

          <DevJson
            v-if="result"
            title="Project Draft Check"
            subtitle="Live result from scripts/docs/project-draft-check.mjs"
            :data="result"
          />
        </div>
      </UCard>
    </UPageBody>
  </UPage>

  <div v-else class="space-y-3">
    <h1 class="text-2xl font-semibold">Project docs not found</h1>
    <p class="text-sm text-dimmed">
      The FireUX docs layer does not yet have a project README.
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useSeoMeta } from '#imports'

definePageMeta({
  layout: 'docs',
  title: 'Project',
})

const { data: page } = await useAsyncData('fireux-docs-project-page', () =>
  queryCollection('fireuxDocs' as never)
    .path('/models/project/README')
    .first()
)

const title = computed(
  () => page.value?.seo?.title || page.value?.title || 'Project'
)
const description = computed(
  () =>
    page.value?.seo?.description ||
    page.value?.description ||
    'FireUX project canon.'
)

useSeoMeta({
  title,
  ogTitle: title,
  description,
  ogDescription: description,
})

const projectObjects = computed(() => {
  const value = page.value?.projectObjects
  return Array.isArray(value)
    ? value.map((entry) => String(entry || '').trim()).filter(Boolean)
    : ['Project', 'App', 'Ecosystem']
})

const pending = ref(false)
const result = ref<any>(null)
const errorMessage = ref('')

const resultSummary = computed(() => {
  if (!result.value) return ''

  const missing = Array.isArray(result.value.missingObjects)
    ? result.value.missingObjects
    : []
  const unexpected = Array.isArray(result.value.unexpectedObjects)
    ? result.value.unexpectedObjects
    : []

  if (!missing.length && !unexpected.length) {
    return 'The current repo truth matches the object list declared on this page.'
  }

  return [
    missing.length ? `Missing: ${missing.join(', ')}` : '',
    unexpected.length ? `Unexpected: ${unexpected.join(', ')}` : '',
  ]
    .filter(Boolean)
    .join(' · ')
})

async function runDraftCheck() {
  pending.value = true
  errorMessage.value = ''

  try {
    result.value = await $fetch('/api/internal/docs/project-draft-check', {
      method: 'POST',
      body: {
        expectedObjects: projectObjects.value,
      },
    })
  } catch (error: any) {
    result.value = null
    errorMessage.value =
      String(error?.data?.message || error?.message || '').trim() ||
      'Unknown project draft check failure.'
  } finally {
    pending.value = false
  }
}
</script>
