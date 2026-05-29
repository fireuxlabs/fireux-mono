<template>
  <GoQrToolShell tool-id="text" name="Text">
    <template #default="{ tool }">
      <GoQrToolTextForm :tool="tool" />
    </template>
  </GoQrToolShell>
</template>
