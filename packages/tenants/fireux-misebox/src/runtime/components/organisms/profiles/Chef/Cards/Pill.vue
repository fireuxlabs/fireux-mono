<template>
  <NuxtLink v-if="props.chef?.to" :to="props.chef.to" class="pill">
    <UAvatar
      :src="props.chef.avatar"
      :alt="props.chef.title"
      size="sm"
      class="avatar"
    />

    <div class="content">
      <span class="title">{{ props.chef.title }}</span>

      <span v-if="props.chef.subtitle" class="subtitle">
        {{ props.chef.subtitle }}
      </span>

      <div v-if="props.chef.badges?.length" class="badges">
        <UBadge
          v-for="badge in props.chef.badges"
          :key="badge"
          size="xs"
          variant="soft"
        >
          {{ badge }}
        </UBadge>
      </div>
    </div>
  </NuxtLink>

  <div v-else class="pill">
    <UAvatar
      :src="props.chef?.avatar"
      :alt="props.chef?.title"
      size="sm"
      class="avatar"
    />

    <div class="content">
      <span class="title">{{ props.chef?.title }}</span>

      <span v-if="props.chef?.subtitle" class="subtitle">
        {{ props.chef.subtitle }}
      </span>

      <div v-if="props.chef?.badges?.length" class="badges">
        <UBadge
          v-for="badge in props.chef.badges"
          :key="badge"
          size="xs"
          variant="soft"
        >
          {{ badge }}
        </UBadge>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ChefCard } from '../../../../../models/profiles/Chef.model.ts'

const props = defineProps<{
  chef: ChefCard.Pill | null
}>()
</script>

<style scoped>
.pill {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  background: var(--ui-background-200, rgba(148, 163, 184, 0.08));
  border: 1px solid var(--ui-border-200, rgba(148, 163, 184, 0.35));
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.pill:hover {
  border-color: var(--ui-primary-500, rgba(79, 70, 229, 0.6));
}

.avatar {
  border-radius: 9999px;
}

.content {
  display: flex;
  flex-direction: column;
}

.title {
  font-weight: 600;
}

.subtitle {
  font-size: 0.8rem;
  color: var(--ui-text-500, rgba(148, 163, 184, 0.9));
}

.badges {
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
}
</style>
