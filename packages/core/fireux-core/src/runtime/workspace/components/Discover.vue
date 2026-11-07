<template>
  <div v-if="!session.pending.value && !session.error.value">
    <section v-if="plan !== 'business'" aria-label="Discover more">
      <h2>{{ title }}</h2>
      <p v-if="plan === 'free'">
        {{ description }}
      </p>
      <UButton
        to="/product"
        label="Explore the possibilities"
        trailing-icon="i-lucide-arrow-up-right"
        variant="link"
      />
    </section>
    <section v-if="plan !== 'business'" aria-label="Plans and pricing">
      <h2>Room to grow</h2>
      <WorkspaceFreemium
        :family="family"
        capability="landing"
        page-label="Workspace"
        placement="discovery"
      />
    </section>
    <section aria-label="Guides and resources">
      <h2>Explore further</h2>
      <UPageCard
        :title="resource.title"
        :description="plan === 'free' ? resource.description : undefined"
        :to="resource.to"
        icon="i-lucide-book-open"
        variant="outline"
      />
    </section>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useAppSession } from '../../app/composables/useAppSession'
import WorkspaceFreemium from './Freemium.vue'
defineProps<{
  family: string
  title: string
  description: string
  resource: { title: string; description: string; to: string }
}>()
const session = useAppSession()
const plan = computed(() => session.appUser.value?.subscription || 'free')
</script>
