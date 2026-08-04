<template>
  <UCard>
    <template #header>
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p
            class="text-xs font-semibold uppercase tracking-widest text-primary"
          >
            Publication
          </p>
          <h2 class="mt-1 text-lg font-semibold text-highlighted">
            {{ title }}
          </h2>
          <p class="mt-1 text-sm leading-6 text-muted">{{ description }}</p>
        </div>
        <UBadge :color="badgeColor" variant="soft">{{ badgeLabel }}</UBadge>
      </div>
    </template>

    <div class="space-y-5">
      <ul v-if="!isPublic" class="space-y-3 text-sm">
        <li
          v-for="item in checklist"
          :key="item.label"
          class="flex items-start gap-3"
        >
          <UIcon
            :name="
              item.ready ? 'i-lucide-circle-check' : 'i-lucide-circle-dashed'
            "
            class="mt-0.5 size-4 shrink-0"
            :class="item.ready ? 'text-success' : 'text-muted'"
          />
          <span :class="item.ready ? 'text-toned' : 'text-muted'">{{
            item.label
          }}</span>
        </li>
      </ul>

      <UAlert
        v-if="publishHint"
        :color="isPublic ? 'neutral' : 'warning'"
        variant="soft"
        :description="publishHint"
      />

      <div class="flex flex-wrap gap-2">
        <UButton
          v-if="!isPublic"
          type="button"
          color="success"
          icon="i-lucide-send"
          :disabled="!canPublish"
          @click="isConfirmOpen = true"
        >
          Publish job
        </UButton>

        <UButton
          v-if="isPubliclyVisible"
          :to="publicTo"
          type="button"
          color="primary"
          variant="soft"
          icon="i-lucide-external-link"
        >
          Open job
        </UButton>

        <UButton
          to="/jobs/manage"
          type="button"
          color="neutral"
          variant="ghost"
          icon="i-lucide-list-checks"
        >
          Your jobs
        </UButton>
      </div>
    </div>
  </UCard>

  <UModal
    v-model="isConfirmOpen"
    title="Publish this job?"
    description="Publishing makes this job visible in the Jobs directory."
  >
    <template #body>
      <div class="space-y-4">
        <UAlert
          color="neutral"
          variant="soft"
          icon="i-lucide-shield-check"
          title="Canonical employer and location"
          description="The published job will use the linked Company and Place as the source of employer and location truth."
        />
        <div class="flex justify-end gap-2">
          <UButton
            type="button"
            color="neutral"
            variant="ghost"
            :disabled="publishing"
            @click="isConfirmOpen = false"
          >
            Keep as draft
          </UButton>
          <UButton
            type="button"
            color="success"
            icon="i-lucide-send"
            :loading="publishing"
            :disabled="publishing"
            @click="onPublish"
          >
            Publish job
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { computed, ref } from 'vue'
import { useJobPublish } from '../../../composables/fireux/firestore/jobs/mutations/useJobPublish'
import type { Job, JobStatus } from '../../../models/job.model'

const props = defineProps<{
  isDirty: boolean
  job: Job
  saving: boolean
  status: JobStatus
}>()

const emit = defineEmits<{
  (event: 'published', job: Job): void
  (event: 'publishing', value: boolean): void
}>()

const toast = useToastify()
const { publishJob } = useJobPublish()
const isConfirmOpen = ref(false)
const publishing = ref(false)
const publishedLocally = ref(false)
const isPublic = computed(
  () => publishedLocally.value || props.job.visibility === 'public'
)
const isPubliclyVisible = computed(
  () => isPublic.value && props.job.status === 'open'
)
const statusIsOpen = computed(() => props.status === 'open')
const canPublish = computed(
  () =>
    !isPublic.value &&
    statusIsOpen.value &&
    !props.isDirty &&
    !props.saving &&
    !publishing.value
)
const publicTo = computed(() => `/jobs/${encodeURIComponent(props.job.id)}`)
const title = computed(() => {
  if (isPubliclyVisible.value) return 'This job is live'
  if (isPublic.value) return 'Public posting paused'
  return 'Ready to publish?'
})
const description = computed(() => {
  if (isPubliclyVisible.value) {
    return 'Open the public page to review the professional experience.'
  }
  if (isPublic.value) {
    return 'This job is published but closed. Reopen and save it to return it to public discovery.'
  }
  return 'Publishing is a separate reviewed action after the draft is saved.'
})
const badgeLabel = computed(() => {
  if (isPubliclyVisible.value) return 'Live'
  if (isPublic.value) return 'Closed'
  return 'Private draft'
})
const badgeColor = computed(() => {
  if (isPubliclyVisible.value) return 'success'
  if (isPublic.value) return 'neutral'
  return 'warning'
})
const checklist = computed(() => [
  { label: 'Canonical Company and Place are linked', ready: true },
  { label: 'Job status is Open', ready: statusIsOpen.value },
  { label: 'All changes are saved', ready: !props.isDirty && !props.saving },
])
const publishHint = computed(() => {
  if (isPublic.value) return ''
  if (!statusIsOpen.value)
    return 'Set the job to Open and save before publishing.'
  if (props.isDirty) return 'Save your changes before publishing this version.'
  if (props.saving) return 'Wait for the current save to finish.'
  return 'The job will appear publicly as soon as publication succeeds.'
})

async function onPublish() {
  if (!canPublish.value || publishing.value) return
  publishing.value = true
  emit('publishing', true)
  try {
    const response = await publishJob({
      id: props.job.id,
      title: props.job.title,
    })
    publishedLocally.value = true
    isConfirmOpen.value = false
    emit('published', response.job)
    toast.add({
      title: 'Job published',
      description: 'The job is now available in the Jobs directory.',
      color: 'success',
      icon: 'i-lucide-circle-check',
    })
  } catch (error) {
    toast.add({
      title: 'Job publish failed',
      description: error instanceof Error ? error.message : 'Please try again.',
      color: 'error',
      icon: 'i-lucide-triangle-alert',
    })
  } finally {
    publishing.value = false
    emit('publishing', false)
  }
}
</script>
