<template>
  <Workspace v-if="$route.meta.workspacePage" />
  <NuxtLayout v-else>
    <NuxtPage />
  </NuxtLayout>
</template>
