<!-- Concurrent edit — 2026-07-21 13:51 CEST — CSS necessity pass: use Nuxt UI's compact alert contract for profile choices. -->
<template>
  <UAlert
    v-if="show"
    title="You are set up as a user"
    :description="description"
    color="neutral"
    variant="subtle"
    orientation="horizontal"
  >
    <template #actions>
      <UButton
        v-for="profileAction in profileActions"
        :key="profileAction.to"
        color="neutral"
        variant="soft"
        :to="profileAction.to"
      >
        {{ profileAction.label }}
      </UButton>
      <UButton color="neutral" variant="ghost" @click="dismissed = true">
        No thanks, just browsing
      </UButton>
    </template>
  </UAlert>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useFireUXConfig } from '../../../app/composables/config/FireUXConfig'

const props = defineProps<{
  currentProfiles?: string[]
}>()

const { profiles: appProfiles } = useFireUXConfig()
const dismissed = ref(false)
const knownProfileActions = [
  { key: 'chef', label: 'Chef', to: '/chefs' },
  { key: 'agent', label: 'Agent', to: '/agents' },
  { key: 'professional', label: 'Professional', to: '/professionals' },
]
const profileActions = computed(() => {
  const configuredProfiles = new Set(
    appProfiles.map((profile) =>
      String(profile ?? '')
        .trim()
        .toLowerCase()
    )
  )

  return knownProfileActions.filter((profile) =>
    configuredProfiles.has(profile.key)
  )
})
const profileActionList = computed(() => {
  const labels = profileActions.value.map((profile) => profile.label)
  if (labels.length < 2) return labels[0] ?? 'a profile'
  if (labels.length === 2) return `${labels[0]} or ${labels[1]}`
  return `${labels.slice(0, -1).join(', ')}, or ${labels.at(-1)}`
})
const description = computed(
  () =>
    `Want to add a profile type today? Choose ${profileActionList.value}, or just keep browsing.`
)
const profileTypes = computed(() =>
  Array.isArray(props.currentProfiles)
    ? props.currentProfiles.filter((profile) => String(profile ?? '').trim())
    : []
)
const show = computed(
  () =>
    !dismissed.value &&
    profileActions.value.length > 0 &&
    profileTypes.value.length === 0
)
</script>
