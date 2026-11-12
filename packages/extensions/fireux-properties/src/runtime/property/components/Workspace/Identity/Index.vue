<template>
  <section>
    <FireState
      v-if="status === 'pending' || status === 'error'"
      :outcome="status"
      entity="Property identity"
    />
    <UAlert
      v-else-if="status !== 'ready'"
      title="Choose a Property"
      description="Select a Property to view its identity."
      color="neutral"
      variant="soft"
      role="status"
      aria-live="polite"
    />
    <UCard v-else-if="selectedProperty">
      <template #header>
        <div class="card__header">
          <h2 class="fx-type-card-heading">Property profile</h2>
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
      <div>
        <UAvatar
          :src="imageUrl || undefined"
          :alt="name"
          icon="i-lucide-house"
          size="3xl"
        />
        <div class="fx-card-body-stack">
          <h3 class="break-words">
            {{ name }}
          </h3>
          <dl class="workspace-surface__grid workspace-surface__grid--2">
            <div>
              <dt>Property type</dt>
              <dd>
                {{ selectedProperty.identity.property_type }}
              </dd>
            </div>
            <div>
              <dt>Units</dt>
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
        />
      </template>
    </USlideover>
    <FireContextRecord
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
import { usePropertyWorkspaceIdentity } from '../../../composables/workspace/usePropertyWorkspaceIdentity'
import PropertyIdentityEdit from './Edit.vue'
const identity = usePropertyWorkspaceIdentity()
const { selectedProperty, name, imageUrl, status } = identity
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
