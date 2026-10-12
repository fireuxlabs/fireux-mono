<template>
  <MoleculesStateCard
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
  <div v-else class="grid gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)]">
    <UCard class="overflow-hidden" :ui="{ body: 'p-0 sm:p-0' }">
      <div
        v-if="imageUrl && !coverFailed"
        class="relative flex h-44 items-center justify-center overflow-hidden bg-gradient-to-br from-primary/25 via-elevated to-primary/5 sm:h-60"
      >
        <img
          :src="imageUrl"
          alt=""
          @error="coverFailed = true"
          class="absolute inset-0 size-full object-cover opacity-20 blur-sm"
        />
      </div>
      <div class="p-6 sm:p-8">
        <div class="flex flex-col gap-6 sm:flex-row sm:items-start">
          <UAvatar
            :src="imageUrl || undefined"
            :alt="name || 'Project'"
            :ui="
              identity.imageFit.value === 'contain'
                ? { image: 'object-contain p-2' }
                : undefined
            "
            icon="i-lucide-folder"
            size="3xl"
            class="rounded-2xl"
            style="
              width: 6rem;
              height: 6rem;
              flex: 0 0 6rem;
              align-self: flex-start;
            "
          />
          <div class="min-w-0 flex-1">
            <h2
              class="break-words text-3xl font-semibold tracking-tight text-highlighted"
            >
              {{ name || 'Untitled project' }}
            </h2>
            <p
              v-if="description"
              class="mt-4 whitespace-pre-line text-base leading-7 text-muted"
            >
              {{ description }}
            </p>
            <p
              v-else-if="identity.publication.value"
              class="mt-4 text-sm text-muted"
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
            <p v-else class="mt-4 text-base leading-7 text-muted">
              Add a description to tell the story of this project.
            </p>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end">
          <slot name="actions" />
        </div>
      </template>
    </UCard>
    <div class="space-y-5">
      <UCard v-if="identity.publicationReady.value">
        <div class="flex items-center justify-between gap-4">
          <h2 class="font-semibold">Your project profile</h2>
          <span class="text-3xl font-semibold text-primary"
            >{{ completion }}%</span
          >
        </div>
        <UProgress
          :model-value="completion"
          class="mt-5"
          aria-label="Identity completion"
        />
        <p class="mt-3 text-sm text-muted">
          {{ completed }} of 3 essentials added: name, description and image.
        </p>
      </UCard>
      <UCard v-if="identity.publication.value">
        <div class="flex items-center gap-3">
          <UIcon name="i-lucide-link" class="size-5 text-primary" />
          <h2 class="font-semibold">Published by your App</h2>
        </div>

        <p class="mt-5 text-lg font-medium">
          {{ identity.publication.value.appName }}
        </p>
        <p class="mt-2 text-sm leading-6 text-muted">
          Description and imagery stay connected to the App’s published
          identity.
        </p>
        <p
          v-if="identity.publication.value.status === 'pending'"
          class="mt-4 text-sm"
          role="status"
        >
          Loading App identity…
        </p>
        <div v-if="identity.publication.value.message" class="mt-4">
          <p role="status" class="text-sm">
            {{ identity.publication.value.message }}
          </p>
          <MoleculesCopyError :message="identity.publication.value.message" />
        </div>
        <UButton
          class="mt-5"
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
import type { ProjectIdentityState } from '../../../composables/useProjectIdentity'
const props = defineProps<{ identity: ProjectIdentityState }>()
const { selectedProject, outcome, name, description, imageUrl } = props.identity
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
