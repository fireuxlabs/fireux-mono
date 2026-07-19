<template>
  <section class="space-y-4">
    <header
      class="flex items-center gap-2 text-base font-semibold text-highlighted"
    >
      <UIcon name="i-heroicons-academic-cap" class="h-5 w-5 text-dimmed" />
      <h2>Education</h2>
    </header>

    <div class="space-y-4">
      <article
        v-for="item in items"
        :key="item.id"
        class="rounded-xl border border-default p-4 shadow-sm"
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
              <h3
                class="text-lg font-semibold text-highlighted"
              >
                {{ item.degree || item.institution }}
              </h3>
              <p
                v-if="item.degree && item.institution"
                class="text-sm text-muted"
              >
                {{ item.institution }}
              </p>
            </div>

            <p
              v-if="item.duration"
              class="text-sm text-muted"
            >
              {{ item.duration }}
            </p>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
interface EducationItem {
  id: string
  degree: string | null
  institution: string | null
  duration: string | null
  logo: string | null
}

defineProps<{ items: EducationItem[] }>()
</script>
