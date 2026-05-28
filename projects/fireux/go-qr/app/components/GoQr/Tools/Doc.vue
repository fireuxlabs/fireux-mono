<template>
  <GoQrToolShell tool-id="doc" name="Doc">
    <template #default="{ tool }">
      <GoQrToolDocForm :tool="tool" />
    </template>
  </GoQrToolShell>
</template>
