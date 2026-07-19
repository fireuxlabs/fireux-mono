<template>
  <section class="space-y-4">
    <header
      class="flex items-center gap-2 text-base font-semibold text-highlighted"
    >
      <UIcon name="i-heroicons-heart" class="h-5 w-5 text-dimmed" />
      <h2>Volunteer Work</h2>
    </header>

    <div class="space-y-4">
      <article
        v-for="item in items"
        :key="item.id"
        class="rounded-xl border border-default p-4 shadow-sm"
      >
        <header class="space-y-1">
          <h3 class="text-lg font-semibold text-highlighted">
            {{ item.organization || item.role }}
          </h3>
          <p
            v-if="item.role && item.organization"
            class="text-sm text-muted"
          >
            {{ item.role }}
          </p>
        </header>

        <p
          v-if="item.duration"
          class="text-sm text-muted"
        >
          {{ item.duration }}
        </p>
        <p
          v-if="item.description"
          class="text-sm text-toned"
        >
          {{ item.description }}
        </p>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
interface VolunteerItem {
  id: string
  organization: string | null
  role: string | null
  duration: string | null
  description: string | null
}

defineProps<{ items: VolunteerItem[] }>()
</script>
