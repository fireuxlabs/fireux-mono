<template>
  <div
    v-if="!session.pending.value && !session.error.value"
    class="mt-6 space-y-8 border-t border-default pt-8"
  >
    <section
      v-if="plan !== 'business'"
      aria-label="Discover more"
      :class="plan === 'free' ? 'space-y-4 py-4' : 'space-y-2'"
    >
      <h2 class="text-xl font-semibold">{{ title }}</h2>
      <p v-if="plan === 'free'" class="max-w-2xl text-muted">
        {{ description }}
      </p>
      <UButton
        to="/product"
        label="Explore the possibilities"
        trailing-icon="i-lucide-arrow-up-right"
        variant="link"
      />
    </section>
    <section
      v-if="plan !== 'business'"
      aria-label="Plans and pricing"
      class="space-y-3"
    >
      <h2 class="text-lg font-semibold">Room to grow</h2>
      <WorkspaceFreemium
        :family="family"
        capability="landing"
        page-label="Workspace"
        placement="discovery"
      />
    </section>
    <section aria-label="Guides and resources" class="space-y-3">
      <h2 class="text-lg font-semibold">Explore further</h2>
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
const plan = computed(() => session.membership.value?.subscription || 'free')
</script>
