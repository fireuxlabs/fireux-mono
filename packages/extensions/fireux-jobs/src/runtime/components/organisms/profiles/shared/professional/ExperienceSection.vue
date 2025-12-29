<template>
  <section class="space-y-4">
    <header
      class="flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-gray-100"
    >
      <UIcon name="i-heroicons-briefcase" class="h-5 w-5 text-gray-400" />
      <h2>{{ title }}</h2>
    </header>

    <div class="space-y-4">
      <article
        v-for="item in items"
        :key="item.id"
        class="rounded-xl border border-gray-100 p-4 shadow-sm dark:border-gray-800"
      >
        <div class="flex items-start gap-3">
          <img
            v-if="item.logo"
            :src="item.logo"
            :alt="item.name || item.role || 'Experience logo'"
            class="h-12 w-12 flex-shrink-0 rounded-xl object-cover"
          />

          <div class="flex-1 space-y-3">
            <div class="space-y-1">
              <h3
                class="text-lg font-semibold text-gray-900 dark:text-gray-100"
              >
                {{ item.role || item.name }}
              </h3>
              <p
                v-if="item.role && item.name"
                class="text-sm text-gray-500 dark:text-gray-400"
              >
                {{ item.name }}
              </p>
            </div>

            <dl class="grid gap-2 text-sm text-gray-500 sm:grid-cols-2">
              <div v-if="item.location" class="space-y-0.5">
                <dt
                  class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
                >
                  Location
                </dt>
                <dd>{{ item.location }}</dd>
              </div>
              <div v-if="item.duration" class="space-y-0.5">
                <dt
                  class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
                >
                  Duration
                </dt>
                <dd>{{ item.duration }}</dd>
              </div>
            </dl>

            <p
              v-if="item.description"
              class="text-sm text-gray-600 dark:text-gray-300"
            >
              {{ item.description }}
            </p>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
interface ExperienceItem {
  id: string
  role: string | null
  name: string | null
  location: string | null
  description: string | null
  duration: string | null
  logo: string | null
}

defineProps<{ title: string; items: ExperienceItem[] }>()
</script>
