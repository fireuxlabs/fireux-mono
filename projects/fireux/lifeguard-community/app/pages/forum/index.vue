<template>
  <main class="community-page">
    <p class="community-kicker">Member forum · Demo</p>
    <h1>Discuss daily practice.</h1>
    <p class="community-intro">
      Use the forum for professional discussion. Do not post personal data,
      confidential workplace information, incident details, or identifiable
      casualty information.
    </p>
    <aside class="community-notice">
      <strong>Community rules:</strong> be respectful, keep stories anonymous,
      report unsafe or abusive content, and use your established emergency and
      workplace channels for urgent matters.
    </aside>
    <section class="community-grid" aria-label="Forum topics">
      <article v-for="topic in topics" :key="topic.id" class="community-card">
        <p class="community-kicker">
          {{ topic.category }} · {{ topic.updated }}
        </p>
        <h2>{{ topic.title }}</h2>
        <p>{{ topic.body }}</p>
        <NuxtLink :to="`/forum/${topic.id}`"
          >Read discussion ({{ topic.replies }} replies)</NuxtLink
        >
      </article>
    </section>
    <section class="community-card mt-8">
      <h2>Start a Demo topic</h2>
      <p v-if="!isAuthenticated">
        Sign in first. Core will create or attach your App membership during the
        shared onboarding flow.
      </p>
      <form v-else @submit.prevent="submit">
        <UInput
          v-model="title"
          placeholder="Topic title"
          required
          class="mb-3"
        />
        <UTextarea
          v-model="body"
          placeholder="Keep the topic anonymous and non-operational."
          required
          class="mb-3"
        />
        <UButton type="submit">Post topic in this browser session</UButton>
      </form>
      <NuxtLink v-if="!isAuthenticated" to="/auth">Sign in to post</NuxtLink>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useCommunityDemo } from '../../composables/useCommunityDemo'

definePageMeta({ layout: 'default' })
const { currentUser, isAuthenticated } = useAuth()
const { topics, addTopic } = useCommunityDemo()
const title = ref('')
const body = ref('')
function submit() {
  if (!isAuthenticated.value || !title.value.trim() || !body.value.trim())
    return
  addTopic(
    {
      category: 'Daily practice',
      title: title.value.trim(),
      body: body.value.trim(),
    },
    currentUser.value?.displayName || 'Community member'
  )
  title.value = ''
  body.value = ''
}
</script>
