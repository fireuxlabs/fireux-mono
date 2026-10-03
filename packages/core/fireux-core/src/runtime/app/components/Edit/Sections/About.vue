<template>
  <UCard :key="app.id" class="section">
    <template #header>
      <div class="section__header">
        <div class="section__copy">
          <h3>App identity</h3>
          <p>Help people recognise your app and understand what it offers.</p>
        </div>
      </div>
    </template>

    <div class="space-y-5">
      <MoleculesFormsEditableSimpleField
        :capture-intent="captureIntent"
        label="Name"
        :maxlength="60"
        :value="app.name"
        placeholder="Your app's name"
        :update="updateAppName"
        @updated="toast.success('App name updated')"
      />
      <MoleculesFormsEditableSimpleField
        :capture-intent="captureIntent"
        label="Tagline"
        :maxlength="160"
        :value="app.tagline"
        placeholder="What does your app help people do?"
        :update="updateTagline"
        @updated="toast.success('Tagline updated')"
      />
      <MoleculesFormsEditableSimpleField
        :capture-intent="captureIntent"
        label="Description"
        type="textarea"
        :rows="3"
        :maxlength="500"
        :value="app.description"
        placeholder="Describe who it is for and what they can do."
        :update="updateDescription"
        @updated="toast.success('App description updated')"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useToastify } from '../../../../composables/ui/useToastify'
import { useAppSettings } from '../../../composables/useAppSettings'
import type { App } from '../../../models/app.model.ts'

const props = defineProps<{ app: App }>()
const { updateAppName, updateTagline, updateDescription, captureIntent } =
  useAppSettings(computed(() => props.app))
const toast = useToastify()
</script>
