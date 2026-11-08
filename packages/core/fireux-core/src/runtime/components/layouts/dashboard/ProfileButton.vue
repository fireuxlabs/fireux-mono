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
import { useAuthPhase } from '../../../composables/fireux/firebase/useAuthPhase'
import { useUserRead } from '../../../user/composables/useUserRead'

defineProps<{ collapsed?: boolean }>()

const { uid, isSignedIn } = useAuthPhase()
const target = computed(() => (isSignedIn.value ? uid.value : ''))
const { user } = useUserRead(target)
const label = computed(() => user.value?.display_name || 'Your profile')
</script>
