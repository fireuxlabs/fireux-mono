<template>
  <div class="cell card-cell professional-theme">
    <div class="header">
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
        <h3 class="name">
          {{ professional.displayName || professional.professional_name }}
        </h3>
        <p v-if="professional.title" class="title">{{ professional.title }}</p>
        <p v-else-if="getCurrentRole(professional)" class="title">
          {{ getCurrentRole(professional) }}
        </p>
      </div>
    </div>

    <p v-if="professional.bio_short" class="bio">
      {{ professional.bio_short }}
    </p>

    <!-- Experience Tags -->
    <div v-if="getExperienceTags(professional).length" class="tags">
      <span
        v-for="tag in getExperienceTags(professional).slice(0, 3)"
        :key="tag"
        class="tag"
      >
        {{ tag }}
      </span>
      <span v-if="getExperienceTags(professional).length > 3" class="more-tags">
        +{{ getExperienceTags(professional).length - 3 }} more
      </span>
    </div>

    <!-- Recent Experience Thumbnails -->
    <div v-if="getRecentExperience(professional).length" class="gallery">
      <img
        v-for="(exp, index) in getRecentExperience(professional).slice(0, 3)"
        :key="index"
        :src="exp.image_url || '/default-company.png'"
        :alt="exp.name"
        class="thumb"
        :title="exp.name"
      />
      <div
        v-if="getRecentExperience(professional).length > 3"
        class="more-images"
      >
        +{{ getRecentExperience(professional).length - 3 }} more
      </div>
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

// Generate experience tags from roles
const getExperienceTags = (professional) => {
  const tags = []

  // Add languages
  if (professional.languages?.length) {
    const nativeLanguages = professional.languages
      .filter((lang) => lang.proficiency === 'Native')
      .map((lang) => lang.language)
    const fluent = professional.languages
      .filter((lang) => ['C1', 'C2'].includes(lang.proficiency))
      .map((lang) => lang.language)

    if (nativeLanguages.length)
      tags.push(`Native ${nativeLanguages.join(', ')}`)
    if (fluent.length) tags.push(`Fluent ${fluent.join(', ')}`)
  }

  // Add experience count
  if (professional.kitchen_experience?.length) {
    tags.push(`${professional.kitchen_experience.length} positions`)
  }

  // Add education
  if (professional.education?.length) {
    tags.push(`${professional.education.length} degrees`)
  }

  // Add certifications
  if (professional.certifications?.length) {
    tags.push(`${professional.certifications.length} certs`)
  }

  return tags
}

// Get recent kitchen experiences with images
const getRecentExperience = (professional) => {
  if (!professional.kitchen_experience?.length) return []

  return [...professional.kitchen_experience]
    .sort((a, b) => parseInt(b.from_year) - parseInt(a.from_year))
    .filter((exp) => exp.image_url)
}
</script>
