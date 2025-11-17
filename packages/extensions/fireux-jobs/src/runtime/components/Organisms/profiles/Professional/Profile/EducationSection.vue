<template>
  <section class="space-y-4">
    <header
      class="flex items-center gap-2 text-base font-semibold text-gray-900"
    >
      <UIcon name="i-heroicons-academic-cap" class="h-5 w-5 text-gray-400" />
        <h2 :class="ui.text.nameMd">Education</h2>
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
            :alt="item.institution || item.degree || 'Education logo'"
            class="h-12 w-12 flex-shrink-0 rounded-xl object-cover"
          />

          <div class="flex-1 space-y-2">
            <div class="space-y-1">
              <h3 :class="ui.text.nameMd">
                {{ item.degree || item.institution }}
              </h3>
              <p v-if="item.degree && item.institution" :class="ui.text.meta">
                {{ item.institution }}
              </p>
            </div>

            <p v-if="item.duration" :class="ui.text.meta">
              {{ item.duration }}
            </p>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { profileUi } from '../../shared/profileUi'

interface EducationItem {
  id: string
  degree: string | null
  institution: string | null
  duration: string | null
  logo: string | null
}

defineProps<{ items: EducationItem[] }>()

const ui = profileUi
</script>
