<template>
  <section v-if="review" class="fx-page-stack" aria-label="Menu for review">
    <h2>{{ review.name }}</h2>
    <p v-if="review.description">{{ review.description }}</p>
    <template v-if="review.format === 'document'">
      <MenuDetailDocumentViewer
        v-if="preview.url"
        :menu="{
          name: review.name,
          file: { ...review.document, url: preview.url },
        }"
        :menu-id="review.menuSlug"
        :document-url="preview.url"
      />
      <p v-else-if="preview.pending" role="status">Loading menu document…</p>
      <UAlert
        v-else-if="preview.error"
        color="error"
        title="Menu preview unavailable"
        :description="preview.error"
      />
      <UButton
        v-if="preview.error"
        variant="outline"
        :loading="preview.pending"
        @click="preview.retry()"
        >Try preview again</UButton
      >
    </template>
    <template v-else>
      <section
        v-for="section in review.sections"
        :key="section.id"
        class="fx-page-stack"
      >
        <h3>{{ section.label }}</h3>
        <article v-for="item in section.items" :key="item.id">
          <h4>
            {{ item.name }} · {{ review.currency }} {{ item.price.toFixed(2) }}
          </h4>
          <p>{{ item.description }}</p>
          <p v-for="option in item.options" :key="option.label">
            {{ option.label }} · {{ review.currency }}
            {{ option.price.toFixed(2) }}
          </p>
        </article>
      </section>
    </template>
  </section>
</template>
<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useMenuFilePreview } from 'fireux-kitchens/runtime/menu/composables/useMenuFilePreview'
import type { MenuExpressRequestView } from '../../composables/useMenuExpressRequest'
const props = defineProps<{
  state: Pick<MenuExpressRequestView, 'request' | 'token' | 'readReviewFile'>
}>()
const review = computed(() => props.state.request?.review)
const preview = reactive(
  useMenuFilePreview({
    enabled: () => review.value?.format === 'document',
    sources: [
      () => props.state.request?.id,
      () => JSON.stringify(props.state.request?.target),
      () => review.value?.revision,
      () => props.state.token,
      () => props.state.readReviewFile,
    ],
    read: (context) =>
      props.state.readReviewFile(review.value!.revision, context),
  })
)
</script>
