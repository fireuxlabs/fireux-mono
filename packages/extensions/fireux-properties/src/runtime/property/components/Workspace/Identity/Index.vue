<template>
  <section class="mx-auto grid w-full min-w-0 max-w-6xl gap-6">
    <MoleculesStateCard
      v-if="readState"
      :state="readState"
      entity="Property identity"
      kind="document"
      :title="readState === 'empty' ? 'Choose a Property' : undefined"
      :description="
        readState === 'empty'
          ? 'Select a Property to view its identity.'
          : undefined
      "
    />
    <UCard v-else-if="selectedProperty">
      <template #header>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <h2 class="font-semibold">Property profile</h2>
          <UButton
            v-if="identity.canWrite.value"
            label="Edit profile"
            icon="i-lucide-pencil"
            color="neutral"
            variant="ghost"
            @click="open = true"
          />
        </div>
      </template>
      <div class="flex flex-col gap-4 sm:flex-row sm:items-start">
        <UAvatar
          :src="imageUrl || undefined"
          :alt="name"
          icon="i-lucide-house"
          size="3xl"
        />
        <div class="min-w-0 space-y-3">
          <h3 class="break-words text-xl font-semibold text-highlighted">
            {{ name }}
          </h3>
          <dl class="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt class="text-muted">Property type</dt>
              <dd class="capitalize">
                {{ selectedProperty.identity.property_type }}
              </dd>
            </div>
            <div>
              <dt class="text-muted">Units</dt>
              <dd>{{ selectedProperty.identity.unit_count }}</dd>
            </div>
          </dl>
          <WorkspaceDedicatedApp :entity="selectedProperty" />
        </div>
      </div>
    </UCard>
    <USlideover v-model:open="open" title="Property profile">
      <template #body
        ><PropertyIdentityEdit
          v-if="open && identity.canWrite.value"
          :key="identity.propertyId.value"
          :identity="identity"
          @close="open = false"
      /></template>
    </USlideover>
    <ContextRecord
      v-if="identity.canWrite.value"
      :key="identity.propertyId.value"
      title="Property AI context"
      endpoint="/api/workspace/property/context"
      :scope="{ propertyId: identity.propertyId.value }"
    />
  </section>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { usePropertyIdentity } from '../../../composables/usePropertyIdentity'
import PropertyIdentityEdit from './Edit.vue'
const identity = usePropertyIdentity()
const { selectedProperty, name, imageUrl, readState } = identity
const { currentUser } = useAuth()
const open = ref(false)
watch(
  [() => currentUser.value?.uid, identity.propertyId, identity.canWrite],
  () => {
    open.value = false
  },
  { flush: 'sync' }
)
</script>
