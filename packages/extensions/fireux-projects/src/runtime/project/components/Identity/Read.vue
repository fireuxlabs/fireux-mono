<template>
  <FireState
    v-if="
      identity.outcome.value === 'pending' || identity.outcome.value === 'error'
    "
    :outcome="identity.outcome.value"
    entity="Project identity"
  />
  <UAlert
    v-else-if="identity.outcome.value !== 'ready'"
    title="Choose a Project"
    description="Select a Project to view its identity."
    color="neutral"
    variant="soft"
    role="status"
    aria-live="polite"
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
            icon="i-lucide-folder"
            size="3xl"
            class="workspace-profile__avatar"
          />
          <div class="workspace-profile__copy">
            <h2 class="workspace-profile__title">
              {{ name || 'Untitled project' }}
            </h2>
            <UBadge
              :label="identity.projectStatus.value"
              :color="
                identity.projectStatus.value === 'active'
                  ? 'success'
                  : 'neutral'
              "
              variant="subtle"
            />
            <p v-if="description" class="workspace-profile__description">
              {{ description }}
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
      <UCard>
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
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { ProjectWorkspaceIdentityState } from '../../composables/workspace/useProjectWorkspaceIdentity'
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
