<template>
  <section class="space-y-4">
    <header
      class="flex items-center gap-2 text-base font-semibold text-gray-900"
    >
      <UIcon name="i-heroicons-heart" class="h-5 w-5 text-gray-400" />
      <h2>Volunteer Work</h2>
    </header>

    <div class="space-y-4">
      <article
        v-for="item in items"
        :key="item.id"
        :class="[ui.surface.base, ui.surface.padding.compact]"
      >
        <header class="space-y-1">
          <h3 :class="ui.text.nameMd">
            {{ item.organization || item.role }}
          </h3>
          <p v-if="item.role && item.organization" :class="ui.text.meta">
            {{ item.role }}
          </p>
        </header>

        <p v-if="item.duration" :class="ui.text.meta">
          {{ item.duration }}
        </p>
        <p v-if="item.description" :class="ui.text.body">
          {{ item.description }}
        </p>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { profileUi } from '../../shared/profileUi'

interface VolunteerItem {
  id: string
  organization: string | null
  role: string | null
  duration: string | null
  description: string | null
}

defineProps<{ items: VolunteerItem[] }>()

const ui = profileUi
</script>
