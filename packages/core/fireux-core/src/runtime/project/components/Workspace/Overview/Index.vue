<template>
  <section class="space-y-4">
    <USkeleton v-if="outcome === 'pending'" class="h-40" />
    <UAlert
      v-else-if="outcome === 'error'"
      color="error"
      title="Project unavailable"
      description="The selected Project could not be loaded."
    />
    <UAlert
      v-else-if="!data"
      title="No Project selected"
      description="Choose a workspace to see its overview."
    />
    <template v-else>
      <UCard>
        <div class="flex items-center gap-3">
          <UAvatar
            :src="data.image_url || undefined"
            :alt="data.name || 'Project'"
            size="lg"
          />
          <div>
            <h1 class="text-xl font-semibold">
              {{ data.name || 'Untitled Project' }}
            </h1>
            <p v-if="data.description" class="mt-1 text-sm text-dimmed">
              {{ data.description }}
            </p>
          </div>
        </div>
      </UCard>
      <UAlert
        v-if="!data.name || !data.description || !data.image_url"
        title="Your Project identity is incomplete"
        description="Review the name, description, and image in Identity."
      />
      <div class="flex flex-wrap gap-3">
        <UButton
          to="/workspace/project/identity"
          label="Identity"
          icon="i-lucide-info"
          color="neutral"
          variant="soft"
        />
        <UButton
          to="/workspace/project/team"
          label="Team"
          icon="i-lucide-users"
          color="neutral"
          variant="soft"
        />
        <UButton
          to="/workspace/project/calendar"
          label="Calendar"
          icon="i-lucide-calendar"
          color="neutral"
          variant="soft"
        />
      </div>
    </template>
  </section>
</template>
<script setup lang="ts">
import { useProjectWorkspace } from '../../../composables/workspace/core/useProjectWorkspace'
const { data, outcome } = useProjectWorkspace()
</script>
