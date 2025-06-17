<template>
  <UCard class="job-card">
    <template #header>
      <div class="flex justify-between items-start">
        <div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {{ job.title }}
          </h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            {{ job.company }}
          </p>
        </div>
        <UBadge :color="statusColor" variant="subtle">
          {{ job.status }}
        </UBadge>
      </div>
    </template>

    <div class="space-y-3">
      <!-- Location -->
      <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <UIcon name="i-heroicons-map-pin" class="w-4 h-4" />
        <span>{{ formatLocation(job.location) }}</span>
        <UBadge v-if="job.location.remote" color="green" variant="soft" size="xs">
          Remote
        </UBadge>
      </div>

      <!-- Employment Type & Salary -->
      <div class="flex items-center gap-4 text-sm">
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-briefcase" class="w-4 h-4" />
          <span class="capitalize">{{ job.employmentType.replace('-', ' ') }}</span>
        </div>
        <div class="flex items-center gap-2" v-if="showSalary">
          <UIcon name="i-heroicons-currency-dollar" class="w-4 h-4" />
          <span>{{ formatSalary(job.salary) }}</span>
        </div>
      </div>

      <!-- Description -->
      <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
        {{ job.description }}
      </p>

      <!-- Tags -->
      <div class="flex flex-wrap gap-2" v-if="job.tags.length > 0">
        <UBadge 
          v-for="tag in job.tags.slice(0, 3)" 
          :key="tag" 
          color="gray" 
          variant="soft" 
          size="xs"
        >
          {{ tag }}
        </UBadge>
        <UBadge 
          v-if="job.tags.length > 3" 
          color="gray" 
          variant="soft" 
          size="xs"
        >
          +{{ job.tags.length - 3 }} more
        </UBadge>
      </div>

      <!-- Posted Date -->
      <div class="flex items-center justify-between text-xs text-gray-500">
        <span>Posted {{ formatRelativeTime(job.postedAt) }}</span>
        <span v-if="job.applicationsCount > 0">
          {{ job.applicationsCount }} applicant{{ job.applicationsCount !== 1 ? 's' : '' }}
        </span>
      </div>
    </div>

    <template #footer v-if="showActions">
      <div class="flex gap-2">
        <UButton 
          v-if="canApply" 
          color="primary" 
          @click="$emit('apply', job)"
          :loading="applying"
        >
          Apply Now
        </UButton>
        <UButton 
          v-if="canEdit" 
          color="gray" 
          variant="ghost" 
          @click="$emit('edit', job)"
        >
          Edit
        </UButton>
        <UButton 
          v-if="canViewApplications" 
          color="gray" 
          variant="ghost" 
          @click="$emit('viewApplications', job)"
        >
          View Applications ({{ job.applicationsCount }})
        </UButton>
        <UButton 
          color="gray" 
          variant="ghost" 
          @click="$emit('view', job)"
        >
          View Details
        </UButton>
      </div>
    </template>
  </UCard>
</template>

<script setup lang="ts">
import type { Job } from '../types'

interface Props {
  job: Job
  showActions?: boolean
  canApply?: boolean
  canEdit?: boolean
  canViewApplications?: boolean
  showSalary?: boolean
  applying?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showActions: true,
  canApply: false,
  canEdit: false,
  canViewApplications: false,
  showSalary: true,
  applying: false
})

defineEmits<{
  apply: [job: Job]
  edit: [job: Job]
  view: [job: Job]
  viewApplications: [job: Job]
}>()

const statusColor = computed(() => {
  switch (props.job.status) {
    case 'active': return 'green'
    case 'paused': return 'yellow'
    case 'closed': return 'gray'
    case 'filled': return 'blue'
    default: return 'gray'
  }
})

const formatLocation = (location: Job['location']) => {
  const parts = [location.city, location.state, location.country].filter(Boolean)
  return parts.join(', ')
}

const formatSalary = (salary: Job['salary']) => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: salary.currency || 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })
  
  if (salary.min === salary.max) {
    return `${formatter.format(salary.min)}/${salary.period}`
  }
  
  return `${formatter.format(salary.min)} - ${formatter.format(salary.max)}/${salary.period}`
}

const formatRelativeTime = (date: Date) => {
  const now = new Date()
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
  
  if (diffInHours < 1) return 'just now'
  if (diffInHours < 24) return `${diffInHours}h ago`
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays}d ago`
  
  const diffInWeeks = Math.floor(diffInDays / 7)
  if (diffInWeeks < 4) return `${diffInWeeks}w ago`
  
  const diffInMonths = Math.floor(diffInDays / 30)
  return `${diffInMonths}mo ago`
}
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
