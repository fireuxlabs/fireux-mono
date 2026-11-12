<template>
  <section class="pagebody" aria-labelledby="explore-projects-title">
    <div>
      <div>
        <p class="fx-type-caption">Discover</p>
        <h2 id="explore-projects-title" class="fx-type-section-title">
          Explore Projects
        </h2>
      </div>
      <UButton
        to="/projects"
        label="Browse all Projects"
        color="neutral"
        variant="ghost"
        trailing-icon="i-lucide-arrow-right"
      />
    </div>
    <FireState v-if="pending" entity="projects" outcome="pending" />
    <UAlert
      v-else-if="error"
      title="Projects could not be loaded"
      description="Your Workspace is still available. Try discovery again."
      color="error"
      variant="soft"
      role="alert"
      aria-live="assertive"
    >
      <template #actions>
        <FireCopyError
          message="Projects could not be loaded&#10;Your Workspace is still available. Try discovery again."
        />
        <UButton label="Try again" variant="soft" @click="refresh()" />
      </template>
    </UAlert>
    <div v-else-if="projects.length" class="pagebody">
      <ULink
        v-for="project in projects.slice(0, 6)"
        :key="project.id"
        :to="`/projects/${project.id}`"
      >
        <img
          v-if="project.identity.image_url"
          :src="project.identity.image_url"
          alt=""
          loading="lazy"
        />
        <h3 class="fx-type-card-heading">
          {{ project.identity.name }}
        </h3>
        <p v-if="project.identity.description" class="fx-type-caption">
          {{ project.identity.description }}
        </p>
        <span>Explore Project →</span>
      </ULink>
    </div>
    <p v-else class="fx-type-caption">
      Projects available to explore will appear here.
    </p>
  </section>
</template>
<script setup lang="ts">
import { useProjects } from 'fireux-projects/runtime/project/composables/useProjects'
const { projects, pending, error, refresh } = useProjects()
</script>
