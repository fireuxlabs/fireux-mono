<!-- Concurrent edit — 2026-07-21 15:42 CEST — User Profile polish: add a truthful root-identity preview for every dashboard. -->
<!-- Concurrent edit — 2026-07-21 15:58 CEST — User bio pass: render the saved biography in the public preview. -->
<template>
  <UPageCard variant="subtle">
    <template #header>
      <div class="flex items-start justify-between gap-4">
        <div>
          <h2 class="text-base font-semibold text-highlighted">
            Public preview
          </h2>
          <p class="mt-1 text-sm text-muted">
            The identity people see across your apps.
          </p>
        </div>

        <UBadge
          label="Public"
          icon="i-lucide-globe-2"
          color="primary"
          variant="soft"
          size="sm"
        />
      </div>
    </template>

    <div class="flex flex-col items-center px-2 py-6 text-center sm:py-8">
      <UAvatar
        :src="card.avatarUrl || undefined"
        :alt="card.displayName"
        size="3xl"
        class="ring-4 ring-default"
      />

      <h3 class="mt-5 text-2xl font-semibold tracking-tight text-highlighted">
        {{ card.displayName }}
      </h3>
      <p v-if="card.handle" class="mt-1 text-sm font-medium text-muted">
        {{ card.handle }}
      </p>

      <div v-if="profileLabels.length" class="mt-4 flex flex-wrap justify-center gap-2">
        <UBadge
          v-for="profile in profileLabels"
          :key="profile"
          :label="profile"
          color="neutral"
          variant="soft"
          size="sm"
        />
      </div>

      <p
        class="mt-5 max-w-sm whitespace-pre-line text-sm leading-6 text-muted"
      >
        {{
          card.bio ||
            'Add a short bio to tell people what you build, do or care about.'
        }}
      </p>
    </div>

    <template #footer>
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center gap-2 text-xs text-muted">
          <UIcon name="i-lucide-fingerprint" class="size-4" />
          <span>One identity across your apps</span>
        </div>

        <UButton
          v-if="card.to"
          :to="card.to"
          label="Open profile"
          icon="i-lucide-external-link"
          color="neutral"
          variant="soft"
          size="sm"
        />
      </div>
    </template>
  </UPageCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { UserCard } from '../../composables/useUserInterface'

const props = defineProps<{ card: UserCard.Card }>()

const profileLabels = computed(() =>
  props.card.profiles.map((profile) =>
    profile
      .replace(/[-_]+/g, ' ')
      .replace(/\b\w/g, (letter) => letter.toUpperCase())
  )
)
</script>
