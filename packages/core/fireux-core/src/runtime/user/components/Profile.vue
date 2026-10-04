<template>
  <section class="user-identity" aria-label="User profile">
    <div class="user-identity__wash" aria-hidden="true" />
    <div class="user-identity__content">
      <UAvatar
        :src="user.avatar || undefined"
        :alt="user.display_name"
        class="size-24 sm:size-32 ring-4 ring-default shadow-xl"
      />
      <div class="min-w-0 flex-1">
        <p class="mb-2 text-sm font-medium tracking-wide text-primary">
          @{{ user.handle }}
        </p>
        <h1
          class="text-3xl font-semibold tracking-tight text-highlighted sm:text-5xl break-words"
        >
          {{ user.display_name }}
        </h1>
        <p
          v-if="user.bio"
          class="mt-4 max-w-xl whitespace-pre-line text-base leading-relaxed text-muted"
        >
          {{ user.bio }}
        </p>
        <UButton
          v-else-if="canEdit"
          to="/dashboard/user-profile"
          label="Add a little about you"
          variant="link"
          color="neutral"
          class="mt-2 px-0"
        />
      </div>
      <UButton
        v-if="canEdit"
        to="/dashboard/user-profile"
        icon="i-lucide-pencil"
        aria-label="Edit your profile"
        color="neutral"
        variant="soft"
        class="self-start rounded-full"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { useUserSession } from '../composables/session/useUserSession'
import { computed } from 'vue'
import type { User } from '../models/user.model'
const props = defineProps<{ user: User }>()
const { user: viewer } = useUserSession()
const canEdit = computed(() => viewer.value?.id === props.user.id)
</script>

<style scoped>
.user-identity {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  border: 1px solid var(--ui-border);
  border-radius: 1.5rem;
  background: var(--ui-bg);
}
.user-identity__wash {
  position: absolute;
  z-index: -1;
  inset: 0;
  background: radial-gradient(
    ellipse at 8% 0%,
    color-mix(in srgb, var(--ui-primary) 22%, transparent),
    transparent 65%
  );
}
.user-identity__content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: clamp(1.5rem, 5vw, 3.5rem);
}
@media (max-width: 540px) {
  .user-identity__content {
    flex-wrap: wrap;
    gap: 1rem;
  }
  .user-identity__content > div {
    order: 3;
    flex-basis: 100%;
  }
  .user-identity__content > a {
    margin-left: auto;
  }
}
</style>
