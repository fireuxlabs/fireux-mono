<template>
  <div
    class="grid gap-3 rounded-lg border border-default p-3 md:grid-cols-[1fr_1fr_auto]"
  >
    <UFormField label="Section">
      <UInput
        v-model="editor.newSectionLabel"
        placeholder="Starters"
        :disabled="editor.savingSection || !editor.canWrite"
      />
    </UFormField>

    <UFormField label="Description">
      <UInput
        v-model="editor.newSectionDescription"
        placeholder="Optional"
        :disabled="editor.savingSection || !editor.canWrite"
      />
    </UFormField>

    <div class="flex items-end">
      <UButton
        icon="i-lucide-plus"
        :loading="editor.savingSection"
        :disabled="!editor.canCreateSection"
        @click="editor.addSection"
      >
        Add
      </UButton>
    </div>
  </div>
</template>
<script setup lang="ts">
import type { UnwrapNestedRefs } from 'vue'
import type { useMenuSectionsEditor } from '../../../../../composables/workspace/menus/useMenuSectionsEditor'
defineProps<{
  editor: UnwrapNestedRefs<ReturnType<typeof useMenuSectionsEditor>>
}>()
</script>
