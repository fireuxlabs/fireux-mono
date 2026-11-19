<template>
  <section class="pagebody" aria-labelledby="docs-supplied-examples">
    <h2 id="docs-supplied-examples" class="fx-type-section-title">
      Supplied-data examples
    </h2>
    <UCard variant="subtle">
      <template #header>
        <h3 class="fx-type-card-heading">PublicKitchenCardsPill</h3>
        <p>Neutral presentation · supplied text and action</p>
      </template>
      <div class="pagebody">
        <p>
          Supply title, subtitle and optional badges/media. This bounded
          identity presentation is also used by the independent
          <ULink :to="miseboxDocsSources.driverConsumer"
            >Driver delivery beacon consumer</ULink
          >. It owns neither that reader nor its dispatch commands.
        </p>
        <PublicKitchenCardsPill
          title="Kitchen label"
          subtitle="Supplied preview text"
          :badges="['Preview']"
          action
          @action="pillActions++"
        />
        <p role="status">Preview activations: {{ pillActions }}</p>
        <UButton
          label="Reset pill preview"
          color="neutral"
          variant="outline"
          @click="pillActions = 0"
        />
        <p>
          <code>action</code> enables its local action event;
          <code>link</code> and <code>to</code> are separate navigation inputs.
          This preview supplies no image URL or record identity.
        </p>
        <ULink :to="miseboxDocsSources.pill"
          >Component source and exact API</ULink
        >
      </div>
    </UCard>
    <UCard variant="subtle">
      <template #header>
        <h3 class="fx-type-card-heading">PublicKitchenCollectionControls</h3>
        <p>Public presentation · supplied models and choices</p>
      </template>
      <div class="pagebody">
        <p>
          Provide <code>countLabel</code> and <code>categories</code>, and
          control <code>query</code>/<code>category</code> with named
          <code>v-model</code>. The parent owns the records and filtering; this
          control emits local choices.
        </p>
        <PublicKitchenCollectionControls
          v-model:query="query"
          v-model:category="category"
          count-label="Preview controls · no Kitchen records"
          :categories="categories"
        />
        <p role="status">
          Preview query: {{ query || 'none' }} · category: {{ category }}
        </p>
        <UButton
          label="Reset controls preview"
          color="neutral"
          variant="outline"
          @click="resetControls"
        />
        <ULink :to="miseboxDocsSources.controls"
          >Component source and exact API</ULink
        >
      </div>
    </UCard>
    <UCard variant="subtle">
      <template #header>
        <h3 class="fx-type-card-heading">FireState in a Misebox page</h3>
        <p>Supported Core presentation · supplied read outcome</p>
      </template>
      <div class="pagebody">
        <p>
          The owning reader supplies its unchanged <code>ReadOutcome</code>.
          Core displays pending, empty or error feedback; idle and ready render
          nothing. Retry emits an intent to the parent. Here it only increments
          a local preview counter.
        </p>
        <label for="docs-read-outcome">Preview read outcome</label>
        <USelect id="docs-read-outcome" v-model="outcome" :items="outcomes" />
        <FireState
          :outcome="outcome"
          entity="example Kitchens"
          retryable
          @retry="retries++"
        />
        <p role="status">Preview retries: {{ retries }}</p>
        <UButton
          label="Reset read-state preview"
          color="neutral"
          variant="outline"
          @click="resetState"
        />
        <ULink :to="miseboxDocsSources.state"
          >Component source and exact API</ULink
        >
      </div>
    </UCard>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { ReadOutcome } from 'fireux-core/runtime/utils/read-outcome'
import { miseboxDocsSources } from '../../content/docs'

const query = ref('')
const category = ref('all')
const pillActions = ref(0)
const outcome = ref<ReadOutcome>('empty')
const retries = ref(0)
const outcomes: ReadOutcome[] = ['idle', 'pending', 'error', 'empty', 'ready']
const categories = [
  { value: 'all', label: 'All examples' },
  { value: 'cafe', label: 'Café example' },
  { value: 'restaurant', label: 'Restaurant example' },
]
function resetControls() {
  query.value = ''
  category.value = 'all'
}
function resetState() {
  outcome.value = 'empty'
  retries.value = 0
}
</script>
