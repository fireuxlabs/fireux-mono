<template>
  <main class="min-h-screen bg-default text-default">
    <UContainer class="py-8 sm:py-10">
      <article class="mx-auto max-w-2xl space-y-6">
        <header class="space-y-3">
          <NuxtLink
            :to="resolvedBackTo"
            class="text-sm font-semibold text-primary hover:underline"
          >
            {{ resolvedBackLabel }}
          </NuxtLink>

          <UBadge
            v-if="eyebrow"
            color="primary"
            variant="soft"
          >
            {{ eyebrow }}
          </UBadge>

          <h1 class="text-4xl font-semibold tracking-normal text-highlighted">
            {{ title }}
          </h1>

          <p
            v-if="description"
            class="text-lg text-muted"
          >
            {{ description }}
          </p>
        </header>

        <div class="space-y-4">
          <slot />
        </div>

        <div
          v-if="hasActions"
          class="flex flex-wrap gap-3"
        >
          <slot name="actions" />
        </div>
      </article>
    </UContainer>
  </main>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue'
import { useFireUXConfig } from '../../app/composables/config/FireUXConfig'

const props = defineProps<{
  title: string
  description?: string
  eyebrow?: string
  backTo?: string
  backLabel?: string
}>()

const slots = useSlots()
const fireux = useFireUXConfig()

const resolvedBackTo = computed(() => props.backTo ?? '/')
const resolvedBackLabel = computed(() => props.backLabel ?? fireux.appName ?? 'Home')
const hasActions = computed(() => Boolean(slots.actions))
</script>
