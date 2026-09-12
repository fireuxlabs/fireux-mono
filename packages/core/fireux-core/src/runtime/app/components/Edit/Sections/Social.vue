<template>
  <UCard class="section">
    <template #header>
      <div class="section__header">
        <div class="section__copy">
          <h3>Open this app</h3>
          <p>
            The public address people follow from your app's directory page.
          </p>
        </div>
      </div>
    </template>

    <MoleculesFormsEditableSimpleField
      label="App address"
      type="url"
      :value="app.social_links?.website"
      placeholder="https://your-app.example"
      :maxlength="2048"
      :update="updateWebsite"
      @updated="toast.success('App address updated')"
    />
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useToastify } from '../../../../composables/ui/useToastify'
import { useAppSettings } from '../../../composables/useAppSettings'
import type { App } from '../../../models/app.model'

const props = defineProps<{ app: App }>()
const { updateWebsite } = useAppSettings(computed(() => props.app))
const toast = useToastify()
</script>
