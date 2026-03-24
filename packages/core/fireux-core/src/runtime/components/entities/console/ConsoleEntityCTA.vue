<template>
  <UPageCTA :title="title" orientation="horizontal">
    <template #links>
      <div class="space-y-4">
        <section v-if="showMy" class="space-y-2">
          <p class="text-sm font-semibold">{{ myLabel }}</p>
          <slot name="my" />
        </section>

        <section v-if="showTest" class="space-y-2">
          <p class="text-sm font-semibold">{{ testLabel }}</p>
          <slot name="test" />
        </section>

        <section v-if="showReadOnly" class="space-y-2">
          <p class="text-sm font-semibold">{{ readOnlyLabel }}</p>
          <slot name="readOnly" />
        </section>

        <section class="space-y-2">
          <UButton
            block
            variant="subtle"
            color="primary"
            icon="i-lucide-book-open"
            :to="learnMoreTo"
          >
            Learn more
          </UButton>
        </section>
      </div>
    </template>

    <template #default>
      <slot />
    </template>
  </UPageCTA>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  title: string
  myLabel: string
  testLabel: string
  readOnlyLabel: string
  learnMoreTo: string
  showMy?: boolean
  showTest?: boolean
  showReadOnly?: boolean
}>(), {
  showMy: true,
  showTest: true,
  showReadOnly: true,
})
</script>
