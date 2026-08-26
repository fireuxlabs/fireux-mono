<template>
  <UBadge
    as="button"
    color="neutral"
    variant="soft"
    class="cursor-pointer rounded-full"
    :aria-label="`Switch from ${ping}`"
    @click="cyclePing"
  >
    {{ ping }}
  </UBadge>
</template>

<script setup lang="ts">
import { computed, useToast } from '#imports'
import { USER_PINGS, type User } from '../models/user.model'
import { useUser } from '../composables/useUser'
import { useUserUpdate } from '../composables/firestore/mutations/useUserUpdate'

const names = USER_PINGS
const user = useUser()
const { currentUser } = user
const { ping: setPing } = useUserUpdate(user, 'PingControl')
const toast = useToast()
const ping = computed<User['ping']>(() => currentUser.value?.ping ?? 'Mark')

async function cyclePing() {
  const current = names.indexOf(ping.value)
  try {
    await setPing(names[(current + 1) % names.length]!)
  } catch (error) {
    toast.add({
      title: 'Ping unchanged',
      description: error instanceof Error ? error.message : 'Update failed.',
      color: 'error',
    })
  }
}
</script>
