<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <span
          class="uppercase tracking-wide text-xs text-[color:var(--ui-text-muted)]"
          >Quick peek</span
        >
        <UBadge variant="subtle" color="neutral">At a glance</UBadge>
      </div>
    </template>

    <ul class="space-y-4">
      <li class="flex gap-3" v-for="item in quickPeek" :key="item.title">
        <div
          class="grid place-items-center rounded-lg w-10 h-10 bg-primary/15 text-primary"
        >
          <UIcon :name="item.icon" />
        </div>
        <div>
          <h3 class="font-medium">{{ item.title }}</h3>
          <p class="text-sm text-[color:var(--ui-text-muted)]">
            {{ item.copy }}
          </p>
        </div>
      </li>
    </ul>

    <template #footer>
      <div class="space-y-3">
        <UButton to="/auth" block color="primary">
          Sign in
        </UButton>
        <UBadge variant="soft" color="primary">{{ footerBadge }}</UBadge>
      </div>
    </template>
  </UCard>
</template>

<script setup lang="ts">
const quickPeek = [
  {
    title: 'Job posts',
    copy: 'Publish roles and share a public link.',
    icon: 'i-lucide-briefcase',
  },
  {
    title: 'Professional profiles',
    copy: 'Showcase experience without PDFs.',
    icon: 'i-lucide-user',
  },
  {
    title: 'Kitchen profiles',
    copy: 'Highlight culture, roles, and teams.',
    icon: 'i-lucide-chef-hat',
  },
]
const footerBadge = 'Jobs · Kitchens · Professionals'
</script>
