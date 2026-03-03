<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <span>Operations</span>
        <UBadge variant="subtle" color="neutral">At a glance</UBadge>
      </div>
    </template>

    <ul class="space-y-4">
      <li
        v-for="item in quickLinks"
        :key="item.title"
        class="flex items-start gap-3"
      >
        <div class="grid h-10 w-10 place-items-center rounded-md bg-primary/15 text-primary">
          <UIcon :name="item.icon" />
        </div>
        <div>
          <h3 class="font-medium">{{ item.title }}</h3>
          <p class="text-sm">
            {{ item.copy }}
          </p>
        </div>
      </li>
    </ul>

    <template #footer>
      <div class="space-y-3">
        <UButton to="/dashboard/portfolios" block color="primary">
          Open portfolio workspace
        </UButton>
        <div class="flex flex-wrap gap-2">
          <NuxtLink to="/portfolios">
            <UBadge variant="soft" color="primary">Portfolios</UBadge>
          </NuxtLink>
          <NuxtLink to="/properties">
            <UBadge variant="soft" color="primary">Properties</UBadge>
          </NuxtLink>
          <NuxtLink to="/compliance">
            <UBadge variant="soft" color="primary">Compliance</UBadge>
          </NuxtLink>
        </div>
      </div>
    </template>
  </UCard>
</template>

<script setup lang="ts">
const quickLinks = [
  {
    title: 'Portfolios',
    copy: 'One client portfolio with many properties under management.',
    icon: 'i-lucide-layers-2',
  },
  {
    title: 'Compliance',
    copy: 'Track obligations, evidence, expiries, and exposure signals.',
    icon: 'i-lucide-shield-check',
  },
  {
    title: 'Incidents',
    copy: 'Capture issues and follow-ups with clear ownership.',
    icon: 'i-lucide-alert-triangle',
  },
]
</script>
