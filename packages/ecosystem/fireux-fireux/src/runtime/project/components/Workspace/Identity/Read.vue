<template>
  <FireStateCard
    v-if="identity.readState.value"
    :state="identity.readState.value"
    entity="Project identity"
    kind="document"
    :title="
      identity.readState.value === 'empty' ? 'Choose a Project' : undefined
    "
    :description="
      identity.readState.value === 'empty'
        ? 'Select a Project to view its identity.'
        : undefined
    "
  />
  <div v-else class="workspace-profile__overview">
    <UCard class="workspace-profile__identity-card">
      <div v-if="imageUrl && !coverFailed" class="workspace-profile__cover">
        <img
          :src="imageUrl"
          alt=""
          @error="coverFailed = true"
          class="workspace-profile__cover-image"
        />
      </div>
      <div class="workspace-profile__identity-body">
        <div class="workspace-profile__identity">
          <UAvatar
            :src="imageUrl || undefined"
            :alt="name || 'Project'"
            :class="{
              'workspace-profile__avatar--contain':
                identity.imageFit.value === 'contain',
            }"
            icon="i-lucide-folder"
            size="3xl"
            class="workspace-profile__avatar"
          />
          <div class="workspace-profile__copy">
            <h2 class="workspace-profile__title">
              {{ name || 'Untitled project' }}
            </h2>
            <p v-if="description" class="workspace-profile__description">
              {{ description }}
            </p>
            <p
              v-else-if="identity.publication.value"
              class="workspace-profile__note"
              role="status"
            >
              {{
                identity.publication.value.status === 'pending'
                  ? 'Loading App identity…'
                  : identity.publication.value.status === 'error'
                    ? 'App identity is unavailable.'
                    : 'No description published by the App.'
              }}
            </p>
            <p v-else class="workspace-profile__description">
              Add a description to tell the story of this project.
            </p>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="workspace-profile__actions">
          <UButton
            v-if="identity.canWrite.value"
            label="Edit Identity"
            icon="i-lucide-pencil"
            @click="$emit('edit')"
          />
        </div>
      </template>
    </UCard>
    <div class="workspace-profile__aside">
      <UCard v-if="identity.publicationReady.value">
        <div class="workspace-profile__header">
          <h2 class="workspace-profile__heading">Your project profile</h2>
          <span class="workspace-profile__completion">{{ completion }}%</span>
        </div>
        <UProgress
          :model-value="completion"
          class="workspace-profile__spacing"
          aria-label="Identity completion"
        />
        <p class="workspace-profile__note">
          {{ completed }} of 3 essentials added: name, description and image.
        </p>
      </UCard>
      <UCard v-if="identity.publication.value">
        <div class="workspace-profile__heading-row">
          <UIcon name="i-lucide-link" class="workspace-profile__icon" />
          <h2 class="workspace-profile__heading">Published by your App</h2>
        </div>

        <p class="workspace-profile__source-name">
          {{ identity.publication.value.appName }}
        </p>
        <p class="workspace-profile__note">
          Description and imagery stay connected to the App’s published
          identity.
        </p>
        <p
          v-if="identity.publication.value.status === 'pending'"
          class="workspace-profile__note"
          role="status"
        >
          Loading App identity…
        </p>
        <div
          v-if="identity.publication.value.message"
          class="workspace-profile__spacing"
        >
          <p role="status" class="workspace-profile__note">
            {{ identity.publication.value.message }}
          </p>
          <FireCopyError :message="identity.publication.value.message" />
        </div>
        <UButton
          class="workspace-profile__spacing"
          :to="identity.publication.value.sourceUrl"
          target="_blank"
          label="View published source"
          trailing-icon="i-lucide-arrow-up-right"
          color="neutral"
          variant="soft"
        />
      </UCard>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { ProjectWorkspaceIdentityState } from '../../../composables/workspace/useProjectWorkspaceIdentity'
const props = defineProps<{ identity: ProjectWorkspaceIdentityState }>()
defineEmits<{ edit: [] }>()
const { name, description, imageUrl } = props.identity
const coverFailed = ref(false)
watch(imageUrl, () => {
  coverFailed.value = false
})
const completed = computed(
  () =>
    [name.value, description.value, imageUrl.value].filter((value) =>
      String(value || '').trim()
    ).length
)
const completion = computed(() => Math.round((completed.value / 3) * 100))
</script>
