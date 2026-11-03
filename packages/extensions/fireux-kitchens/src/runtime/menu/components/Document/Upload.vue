<template>
  <form
    class="fx-page-stack"
    aria-label="Document Menu"
    @submit.prevent="menu.publish"
  >
    <UAlert
      v-if="menu.error"
      color="error"
      title="Menu unavailable"
      :description="menu.error"
    />
    <UFormField v-if="menu.kitchenOptions.length > 1" label="Kitchen">
      <USelect
        v-model="menu.kitchenChoice"
        :items="menu.kitchenOptions"
        :disabled="menu.busy"
      />
    </UFormField>
    <UFormField v-if="menu.data && menu.data.menus.length > 1" label="Menu">
      <USelect
        :model-value="menu.menuChoice || menu.data.menuId"
        :items="menu.data.menus"
        :disabled="menu.busy"
        @update:model-value="menu.menuChoice = $event"
      />
    </UFormField>
    <UAlert
      v-if="menu.data?.acceptsDocument === false"
      color="info"
      title="Choose an empty or document Menu"
      description="This Menu contains structured content. Choose another Menu to attach a document."
    />
    <UFormField v-if="!menu.data?.venue" label="Venue name">
      <UInput
        v-model="menu.venue"
        placeholder="Your restaurant or café"
        maxlength="120"
        :disabled="menu.busy"
      />
    </UFormField>
    <UFileUpload
      v-model="menu.file"
      label="Upload your menu"
      description="One PDF, JPG, PNG or WebP · up to 10 MB"
      accept="application/pdf,image/jpeg,image/png,image/webp"
      :multiple="false"
      :disabled="menu.busy"
      variant="area"
    />
    <UButton
      v-if="menu.file"
      type="submit"
      :label="menu.data?.document ? 'Replace document' : 'Publish menu'"
      :disabled="!menu.canPublish"
      :loading="menu.busy"
    />
    <p v-if="menu.message" role="status">{{ menu.message }}</p>
    <UButton
      v-if="menu.kitchenId && !menu.busy"
      type="button"
      label="Reload saved Menu"
      variant="ghost"
      :loading="menu.loading"
      @click="menu.reload"
    />
  </form>
</template>

<script setup lang="ts">
import type { UnwrapNestedRefs } from 'vue'
import type { useMenuDocument } from '../../composables/useMenuDocument'

defineProps<{ menu: UnwrapNestedRefs<ReturnType<typeof useMenuDocument>> }>()
</script>
