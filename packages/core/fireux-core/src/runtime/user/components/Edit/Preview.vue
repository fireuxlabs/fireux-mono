<!-- Concurrent edit — 2026-07-21 15:42 CEST — User Profile polish: add a truthful root-identity preview for every dashboard. -->
<!-- Concurrent edit — 2026-07-21 15:58 CEST — User bio pass: render the saved biography in the public preview. -->
<template>
  <UPageCard variant="subtle">
    <template #header>
      <div>
        <div>
          <h2>Profile preview</h2>
          <p>The identity people see across your apps.</p>
        </div>

        <UBadge
          label="Profile"
          icon="i-lucide-user-round"
          color="primary"
          variant="soft"
          size="sm"
        />
      </div>
    </template>

    <div>
      <UAvatar
        :src="view?.avatarUrl || undefined"
        :alt="user.display_name"
        size="3xl"
      />

      <h3>
        {{ user.display_name }}
      </h3>
      <p v-if="view?.handleLabel">
        {{ view.handleLabel }}
      </p>

      <p>
        {{
          user.bio ||
          'Add a short bio to tell people what you build, do or care about.'
        }}
      </p>
    </div>

    <template #footer>
      <div>
        <div>
          <UIcon name="i-lucide-fingerprint" />
          <span>One identity across your apps</span>
        </div>

        <UButton
          v-if="view?.to"
          :to="view.to"
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
import type { User } from '../../models/user.model'
import { useUserView } from '../../composables/useUserView'

const props = defineProps<{ user: User }>()
const { toView } = useUserView()
const view = computed(() => toView(props.user))
</script>
