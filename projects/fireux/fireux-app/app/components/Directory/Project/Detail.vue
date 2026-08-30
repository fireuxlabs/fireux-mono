<template>
  <article class="project-detail">
    <!-- 01 Identity -->
    <header class="project-detail__hero">
      <div class="project-detail__back">
        <UButton
          to="/projects"
          color="neutral"
          variant="ghost"
          icon="i-lucide-arrow-left"
          size="sm"
          >All Projects</UButton
        >
      </div>
      <div class="project-detail__identity">
        <UAvatar
          :src="project.image_url || undefined"
          :text="project.name || project.id"
          :alt="project.name || project.id"
          icon="i-lucide-folder-kanban"
          size="3xl"
          class="project-detail__avatar"
        />
        <div>
          <p class="project-detail__eyebrow">FireUX Project</p>
          <h1>{{ project.name || project.id }}</h1>
          <p class="project-detail__description">{{ project.description }}</p>
        </div>
      </div>
      <dl class="project-detail__stats">
        <div>
          <dt>Connected Apps</dt>
          <dd>{{ apps.length }}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>{{ project.status }}</dd>
        </div>
      </dl>
    </header>

    <!-- 02 Apps -->
    <section class="project-detail__section">
      <CollectionHeader
        title="Apps in this Project"
        :description="appSectionDescription"
      />
      <div class="project-detail__apps">
        <NuxtLink
          v-for="app in apps"
          :key="app.id"
          :to="`/apps/${encodeURIComponent(app.id)}`"
          class="project-detail__app"
        >
          <div class="project-detail__app-visual">
            <img
              v-if="app.media?.cover_url"
              :src="app.media.cover_url"
              alt=""
              loading="lazy"
            /><UIcon v-else name="i-lucide-app-window" aria-hidden="true" />
          </div>
          <div class="project-detail__app-copy">
            <UAvatar
              :src="app.media?.logo_url || undefined"
              :text="app.name || app.id"
              :alt="app.name || app.id"
              size="md"
            />
            <div>
              <h2>{{ app.name || app.id }}</h2>
              <p>
                {{
                  app.description ||
                  app.short_bio ||
                  app.tagline ||
                  'FireUX App.'
                }}
              </p>
            </div>
            <UIcon name="i-lucide-arrow-up-right" aria-hidden="true" />
          </div>
        </NuxtLink>
      </div>
    </section>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { App } from 'fireux-core/runtime/app/models/app.model'
import type { Project } from 'fireux-core/runtime/project/models/project.model'

const props = defineProps<{ project: Project; apps: App[] }>()
const appSectionDescription = computed(
  () =>
    `${props.apps.length} ${props.apps.length === 1 ? 'App is' : 'Apps are'} connected through App.project_id.`
)
</script>

<style scoped src="../../../pages/projects/project-detail.css"></style>
