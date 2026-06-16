<template>
  <EntityOperatorPanel
    entity-label="Project"
    title="Project Operations"
    :description="panelDescription"
    :aligned="aligned"
    :not-aligned="notAligned"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ProjectSurface } from '../../composables/fireux/firestore/core/project/utils/view/useProjectInterface'

const props = defineProps<{
  project?: ProjectSurface | null
}>()

const aligned = ['Identity', 'App', 'Ecosystem']
const notAligned: string[] = []
const projectName = computed(() =>
  String(props.project?.name || props.project?.slug || props.project?.id || '').trim()
)
const panelDescription = computed(() =>
  projectName.value
    ? `Project operators manage apps, ecosystem links, and project work for ${projectName.value}.`
    : 'Project operators manage apps, ecosystem links, and project work from the project console.'
)
</script>
