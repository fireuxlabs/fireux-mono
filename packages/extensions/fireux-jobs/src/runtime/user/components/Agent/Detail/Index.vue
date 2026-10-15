<template>
  <AgentCardsProfile v-if="agentCard" :card="agentCard" :profile="profile">
    <template #actions>
      <UButton
        v-if="isSelf"
        label="Manage profile"
        icon="i-lucide-pencil"
        color="neutral"
        variant="outline"
        @click="navigateTo('/dashboard/agent/profile')"
      />
    </template>
  </AgentCardsProfile>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { navigateTo } from '#imports'
import { useUserSession } from 'fireux-core/runtime/user/composables/session/useUserSession'
import type { ProfileDirectoryEntry } from 'fireux-core/runtime/user/models/user-directory.model'
import type { AgentProfilePayload } from '../../../utils/profiles/Agent/agent'
import { useAgentInterface } from '../../../composables/profiles/Agent/utils/view/useAgentInterface'
const props = defineProps<{
  profile: AgentProfilePayload & { id: string }
  user: ProfileDirectoryEntry<AgentProfilePayload>['user']
}>()
const { user: sessionUser } = useUserSession()
const { profile: agentInterface } = useAgentInterface()
const agentCard = computed(() =>
  props.profile ? agentInterface(props.profile, props.user) : null
)
const isSelf = computed(() =>
  Boolean(props.user?.id && sessionUser.value?.id === props.user.id)
)
</script>
