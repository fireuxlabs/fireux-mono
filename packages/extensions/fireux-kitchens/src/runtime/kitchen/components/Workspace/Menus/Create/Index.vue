<template>
  <section class="space-y-4">
    <WorkspaceKitchenMenusCreateBlank />
    <div id="create-menu" class="scroll-mt-24">
      <WorkspaceKitchenMenusCreateUrl />
    </div>

    <div id="import-menu" class="scroll-mt-24">
      <WorkspaceKitchenMenusCreateUpload
        title="Upload menu source"
        description="Use a clear menu name, such as main, lunch, or drinks. Multiple photos are fine."
        cta-label="Upload menu source"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
</script>
