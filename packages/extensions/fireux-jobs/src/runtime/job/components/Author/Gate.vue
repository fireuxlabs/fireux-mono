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
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import UserCreateSystem from 'fireux-core/runtime/user/components/Create/System.vue'
import { computed } from 'vue'
import type { JobAuthorReadiness } from '../../composables/useJobPermissions'
import AgentCreateSystem from '../../../user/components/Agent/Create/System.vue'

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
  () => props.readiness === 'needs-agent-capability'
)
const gateTitle = computed(() =>
  needsAttachment.value
    ? 'Finish your employer access'
    : 'Create your hiring profile'
)
const gateDescription = computed(() =>
  needsAttachment.value
    ? `Your hiring profile exists. Connect it to ${appName} to create and publish jobs.`
    : 'Jobs are authored through a public hiring profile so people always know who is posting.'
)
const profileTitle = computed(() =>
  needsAttachment.value ? 'Connect your profile' : 'Create your profile'
)
const profileDescription = computed(() =>
  needsAttachment.value
    ? `Complete the App-level hiring profile required to post jobs on ${appName}.`
    : 'Set up the hiring identity professionals will see beside your job postings.'
)
const actionLabel = computed(() =>
  needsAttachment.value ? 'Finish posting access' : 'Create hiring profile'
)
</script>
