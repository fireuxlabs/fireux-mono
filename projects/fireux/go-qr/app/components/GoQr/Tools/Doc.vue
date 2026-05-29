<template>
  <GoQrToolShell tool-id="doc" name="Doc">
    <template #default="{ tool }">
      <p class="text-sm leading-6 text-muted">
        {{ tool.tool.message }}
      </p>
    </template>
  </GoQrToolShell>
</template>
