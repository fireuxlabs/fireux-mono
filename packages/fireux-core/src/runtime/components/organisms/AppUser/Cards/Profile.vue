<template>
  <UCard>
    <div class="flex items-center gap-4 mb-6">
      <UAvatar
        :src="user?.avatar"
        :alt="userName"
        size="xl"
        :text="getInitials(userName)"
      />
      <div>
        <h2 class="text-xl font-semibold">
          {{ userName }}
        </h2>
        <p v-if="user?.email" class="text-gray-600 text-sm">
          {{ user.email }}
        </p>
      </div>
    </div>

    <div
      v-if="user?.display_name && user?.display_name !== userName"
      class="mb-4"
    >
      <h3 class="font-medium mb-2">Display Name</h3>
      <p class="text-gray-700">{{ user.display_name }}</p>
    </div>
  </UCard>
</template>

<script setup>
// Props from parent
const props = defineProps({
  user: {
    type: Object,
    default: null,
  },
})

// Computed property for user display name with priority logic
const userName = computed(() => {
  if (!props.user) return 'User'
  return (
    props.user.full_name ||
    props.user.display_name ||
    props.user.email ||
    'User'
  )
})

// Computed property for formatted join date
const formattedJoinDate = computed(() => {
  if (!props.user?.created_at) return null

  let date
  try {
    date =
      typeof props.user.created_at === 'string'
        ? new Date(props.user.created_at)
        : props.user.created_at

    // Check if date is valid
    if (!date || isNaN(date.getTime())) return null

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    })
  } catch (error) {
    console.warn(
      'Invalid date format for user created_at:',
      props.user.created_at
    )
    return null
  }
})

function getInitials(name) {
  if (!name) return '?'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
</script>
