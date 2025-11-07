<template>
  <UCard class="profile-card">
    <div class="profile-header">
      <UAvatar
        :src="props.employer.avatar"
        :alt="props.employer.title || 'Employer'"
        :text="props.employer.initials"
        size="md"
      />
      <div class="profile-info">
        <h4 class="profile-name">
          {{ props.employer.title || 'Employer' }}
        </h4>
        <p v-if="props.employer.subtitle" class="profile-subtitle">
          {{ props.employer.subtitle }}
        </p>
      </div>
    </div>

    <p v-if="props.employer.bio_short" class="profile-bio">
      {{ props.employer.bio_short }}
    </p>

    <div v-if="props.employer.specialties?.length" class="profile-tags">
      <span
        v-for="(tag, i) in props.employer.specialties.slice(0, 3)"
        :key="tag + i"
        class="tag"
        >{{ tag }}</span
      >
      <span v-if="props.employer.specialties.length > 3" class="tag-more">
        +{{ props.employer.specialties.length - 3 }} more
      </span>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { EmployerCard } from '../../../../../models/profiles/Employer.model'

const props = defineProps<{ employer: EmployerCard.Cell }>()
</script>
