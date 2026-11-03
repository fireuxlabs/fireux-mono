<template>
  <section
    v-if="document.available || document.menuPath"
    class="fx-page-stack"
    aria-label="Document Menu"
  >
    <h3 class="fx-type-card-heading">Use your document as the Menu</h3>
    <template v-if="document.menuPath">
      <p>Your document Menu is saved. Review it before publishing.</p>
      <UButton
        @click="document.openMenu"
        label="Open document Menu"
        variant="outline"
      />
    </template>
    <form v-else class="fx-page-stack" @submit.prevent="document.prepare">
      <p>Keep the PDF or image as it is. No extraction is required.</p>
      <UFormField label="Menu name"
        ><UInput
          v-model="document.name"
          :disabled="document.pending"
          maxlength="160"
      /></UFormField>
      <p v-if="document.error" role="alert" class="menu-editor-error">
        {{ document.error }}
      </p>
      <UButton
        type="submit"
        label="Create document Menu"
        :loading="document.pending"
        :disabled="!context.canWrite.value || !document.name.trim()"
      />
    </form>
  </section>
</template>
<script setup lang="ts">
import { reactive } from 'vue'
import { useMenuDocumentPreparation } from '../../../../composables/menu/useMenuDocumentPreparation'
import type { MenuSourceProcessContext } from '../../../../composables/menu/useMenuSourceProcess'
const props = defineProps<{ context: MenuSourceProcessContext }>()
const document = reactive(useMenuDocumentPreparation(props.context))
</script>
