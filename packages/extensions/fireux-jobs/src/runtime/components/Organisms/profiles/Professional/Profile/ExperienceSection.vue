<template>
  <section class="space-y-4">
    <header class="flex items-center gap-2">
      <UIcon name="i-heroicons-briefcase" class="h-5 w-5 text-gray-400" />
      <h2 :class="ui.text.nameMd">{{ title }}</h2>
    </header>

    <div class="space-y-4">
      <article
        v-for="item in items"
        :key="item.id"
        :class="[ui.surface.base, ui.surface.padding.compact]"
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
              <h3 :class="ui.text.nameMd">
                {{ item.role || item.name }}
              </h3>
              <p v-if="item.role && item.name" :class="ui.text.meta">
                {{ item.name }}
              </p>
            </div>

            <dl class="grid gap-2 text-sm text-gray-500 sm:grid-cols-2">
              <div v-if="item.location" class="space-y-0.5">
                <dt :class="ui.text.labelSm">Location</dt>
                <dd>{{ item.location }}</dd>
              </div>
              <div v-if="item.duration" class="space-y-0.5">
                <dt :class="ui.text.labelSm">Duration</dt>
                <dd>{{ item.duration }}</dd>
              </div>
            </dl>

            <p v-if="item.description" :class="ui.text.body">
              {{ item.description }}
            </p>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { profileUi } from '../../shared/profileUi'

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

const ui = profileUi
</script>
