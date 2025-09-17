<template>
  <UCard class="profile-card">
    <div class="profile-header">
      <UAvatar :src="employer.avatar" :alt="employer.name" size="md" />
      <div class="profile-info">
        <h4 class="profile-name">{{ employer.name }}</h4>
        <p v-if="employer.title" class="profile-subtitle">
          {{ employer.title }}
        </p>
      </div>
    </div>

    <p v-if="employer.bioShort" class="profile-bio">
      {{ employer.bioShort }}
    </p>

    <div v-if="employer.specialties?.length" class="profile-tags">
      <span
        v-for="(tag, i) in employer.specialties.slice(0, 3)"
        :key="tag + i"
        class="tag"
        >{{ tag }}</span
      >
      <span v-if="employer.specialties.length > 3" class="tag-more">
        +{{ employer.specialties.length - 3 }} more
      </span>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { EmployerCellProps } from '../../../../../models/profiles/Employer.model'
defineProps<{ employer: EmployerCellProps }>()
</script>
