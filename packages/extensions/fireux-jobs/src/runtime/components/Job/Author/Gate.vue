<template>
  <UAlert
    v-if="readiness === 'unavailable'"
    color="error"
    variant="soft"
    icon="i-lucide-triangle-alert"
    title="Job posting access is unavailable"
    description="We could not verify your current App membership. Please reload and try again."
  />

  <UPageCTA
    v-else-if="readiness === 'needs-app-membership'"
    title="Finish your account setup"
    :description="`Create or repair your ${appName} membership before preparing an employer profile.`"
    orientation="horizontal"
  >
    <UserCreateSystem />
  </UPageCTA>

  <UPageCTA
    v-else
    :title="gateTitle"
    :description="gateDescription"
    orientation="horizontal"
  >
    <AgentCreateSystem
      :action-label="actionLabel"
      :description="profileDescription"
      eyebrow="Employer identity"
      :return-to="returnTo"
      :title="profileTitle"
    />
  </UPageCTA>
</template>

<script setup lang="ts">
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import UserCreateSystem from 'fireux-core/runtime/components/User/Create/System.vue'
import { computed } from 'vue'
import type { JobAuthorReadiness } from '../../../composables/useJobPermissions'
import AgentCreateSystem from '../../Agent/Create/System.vue'

const props = withDefaults(
  defineProps<{
    readiness: JobAuthorReadiness
    returnTo?: string
  }>(),
  {
    returnTo: '/jobs/manage',
  }
)

const { appName } = useFireUXConfig()
const needsAttachment = computed(
  () => props.readiness === 'needs-agent-app-support'
)
const gateTitle = computed(() =>
  needsAttachment.value
    ? 'Finish your employer access'
    : 'Create your Agent profile'
)
const gateDescription = computed(() =>
  needsAttachment.value
    ? `Your Agent identity exists. Connect it to ${appName} to create and publish jobs.`
    : 'Jobs are authored by your professional identity so people always know who is posting.'
)
const profileTitle = computed(() =>
  needsAttachment.value ? 'Connect your profile' : 'Create your profile'
)
const profileDescription = computed(() =>
  needsAttachment.value
    ? `Complete the App-level Agent record required to post jobs on ${appName}.`
    : 'Set up the employer identity professionals will see beside your job postings.'
)
const actionLabel = computed(() =>
  needsAttachment.value ? 'Finish posting access' : 'Create Agent profile'
)
</script>
