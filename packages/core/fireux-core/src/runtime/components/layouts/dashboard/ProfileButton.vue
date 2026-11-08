<template>
  <UButton
    to="/dashboard/user-profile"
    :label="collapsed ? undefined : label"
    icon="i-lucide-user"
    :aria-label="label"
    color="neutral"
    variant="ghost"
    block
    :square="collapsed"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUserSession } from '../../../user/composables/session/useUserSession'
import { useUserView } from '../../../user/composables/useUserView'

defineProps<{ collapsed?: boolean }>()

const { currentUser } = useUserSession()
const { pill } = useUserView()
const label = computed(
  () => pill(currentUser.value)?.displayName || 'Your profile'
)
</script>
