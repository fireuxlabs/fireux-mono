<template>
  <div class="cell card-pill professional-theme">
    <img
      :src="
        professional.avatarUrl ||
        professional.profile_image?.url ||
        '/default-avatar.png'
      "
      :alt="`${professional.displayName || professional.professional_name} avatar`"
      class="avatar"
    />
    <div class="info">
      <h4 class="name">
        {{ professional.displayName || professional.professional_name }}
      </h4>
      <p v-if="professional.title" class="subtitle">{{ professional.title }}</p>
      <p v-else-if="getCurrentRole(professional)" class="subtitle">
        {{ getCurrentRole(professional) }}
      </p>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  professional: {
    type: Object,
    required: true,
  },
})

// Get current role from most recent kitchen experience
const getCurrentRole = (professional) => {
  if (!professional.kitchen_experience?.length) return null

  // Find ongoing position first
  const ongoingRole = professional.kitchen_experience.find((exp) => exp.ongoing)
  if (ongoingRole) return ongoingRole.role

  // Otherwise get most recent
  const sorted = [...professional.kitchen_experience].sort(
    (a, b) => parseInt(b.from_year) - parseInt(a.from_year)
  )
  return sorted[0]?.role
}
</script>
