<template>
  <section
    class="mt-12 space-y-6 border-t border-default pt-10"
    aria-labelledby="explore-projects-title"
  >
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p class="text-sm font-medium text-primary">Discover</p>
        <h2
          id="explore-projects-title"
          class="mt-1 text-2xl font-semibold tracking-tight"
        >
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
    <MoleculesStateCard
      v-if="pending"
      state="loading"
      entity="projects"
      surface="bare"
    />
    <MoleculesStateCard
      v-else-if="error"
      state="error"
      title="Projects could not be loaded"
      description="Your Workspace is still available. Try discovery again."
      surface="bare"
    >
      <template #actions
        ><UButton label="Try again" variant="soft" @click="refresh()"
      /></template>
    </MoleculesStateCard>
    <div
      v-else-if="projects.length"
      class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
    >
      <NuxtLink
        v-for="project in projects.slice(0, 6)"
        :key="project.id"
        :to="`/projects/${project.id}`"
        class="group flex flex-col gap-3 rounded-2xl bg-elevated p-5 ring-1 ring-default transition hover:ring-primary focus-visible:outline-2 focus-visible:outline-primary"
      >
        <img
          v-if="project.identity.image_url"
          :src="project.identity.image_url"
          alt=""
          class="aspect-video rounded-lg object-cover"
          loading="lazy"
        />
        <h3 class="font-semibold text-highlighted group-hover:text-primary">
          {{ project.identity.name }}
        </h3>
        <p v-if="project.identity.description" class="line-clamp-2 text-sm text-muted">
          {{ project.identity.description }}
        </p>
        <span class="mt-auto text-sm text-primary">Explore Project →</span>
      </NuxtLink>
    </div>
    <p v-else class="text-sm text-muted">
      Projects available to explore will appear here.
    </p>
  </section>
</template>
<script setup lang="ts">
import { useProjects } from 'fireux-fireux/runtime/project/composables/useProjects'
const { projects, pending, error, refresh } = useProjects()
</script>
