<!-- Concurrent edit — 2026-07-21 13:13 CEST — Project Users Operation: expand the practical cross-app roadmap. -->
<template>
  <PublicSimplePage
    title="Users"
    description="Manage your users."
    eyebrow="Project console"
    back-to="/operations#project"
    back-label="Operations"
  >
    <UCard variant="subtle">
      <template #header>
        <h2 class="m-0 text-lg font-semibold text-highlighted">
          Roadmap
        </h2>
      </template>

      <ul class="grid gap-3">
        <li
          v-for="item in roadmap"
          :key="item.label"
          class="flex items-center gap-3 text-sm"
        >
          <UIcon
            :name="item.done ? 'i-lucide-circle-check' : 'i-lucide-circle'"
            :class="item.done ? 'text-primary' : 'text-muted'"
            class="size-5 shrink-0"
          />
          <span :class="item.done ? 'text-highlighted' : 'text-muted'">
            {{ item.label }}
          </span>
        </li>
      </ul>
    </UCard>

    <template #actions>
      <UButton to="/users" icon="i-lucide-users">
        View users
      </UButton>
    </template>
  </PublicSimplePage>
</template>

<script setup lang="ts">
const roadmap = [
  { label: 'Shared FireUX user identity', done: true },
  { label: "See users across all of your project's apps", done: false },
  { label: 'See which app each user joined through', done: false },
  {
    label: 'Receive a notification when a new user signs up to one of your apps',
    done: false,
  },
  { label: 'Invite users to your project', done: false },
  { label: 'Control which apps each user can access', done: false },
  { label: 'Assign roles and permissions', done: false },
  { label: 'Suspend or remove access', done: false },
  { label: 'Review membership and access history', done: false },
] as const

useSeoMeta({
  title: 'Manage your users - FireUX',
  description: 'Manage users across a FireUX project and its connected apps.',
})
</script>
