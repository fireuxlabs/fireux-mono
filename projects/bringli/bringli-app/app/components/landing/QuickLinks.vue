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
        <UButton to="/suppliers" block color="primary">
          Open supplier workspace
        </UButton>
        <div class="flex flex-wrap gap-2">
          <NuxtLink to="/suppliers">
            <UBadge variant="soft" color="primary">Suppliers</UBadge>
          </NuxtLink>
          <NuxtLink to="/suppliers">
            <UBadge variant="soft" color="primary">Coverage</UBadge>
          </NuxtLink>
          <NuxtLink to="/suppliers">
            <UBadge variant="soft" color="primary">Readiness</UBadge>
          </NuxtLink>
        </div>
      </div>
    </template>
  </UCard>
</template>

<script setup lang="ts">
const quickLinks = [
  {
    title: 'Supplier management',
    copy: 'Keep supplier records clean with one workspace for profiles and readiness.',
    icon: 'i-lucide-users',
  },
  {
    title: 'Dropoff readiness',
    copy: 'Track delivery areas and service-level capability.',
    icon: 'i-lucide-package-check',
  },
  {
    title: 'Operational confidence',
    copy: 'Run a tighter first pipe before widening into full marketplace flows.',
    icon: 'i-lucide-shield-check',
  },
]
</script>
