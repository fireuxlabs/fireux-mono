<template>
  <UButton
    to="https://fireux.app/gpt"
    target="_blank"
    :label="modelLabel"
    color="neutral"
    variant="ghost"
    size="xs"
    :title="modelLabel"
    aria-label="About this FireUX AI model"
  >
    <template #leading>
      <img src="/img/core/brand/logo.svg" alt="" width="16" height="16" />
    </template>
  </UButton>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRuntimeConfig } from '#imports'

const props = withDefaults(defineProps<{ developmentCodex?: boolean }>(), {
  developmentCodex: false,
})

const runtime = useRuntimeConfig() as {
  public?: {
    fireux?: {
      ai?: {
        mode?: string
        provider?: string
        model?: string
      }
    }
  }
}
const ai = computed(() => runtime.public?.fireux?.ai ?? {})
const modelLabel = computed(() => {
  if (props.developmentCodex) return 'FireUX · Codex development'
  const mode = String(ai.value.mode || '').trim()
  const provider = String(ai.value.provider || '').trim()
  const model = String(ai.value.model || '').trim() || 'gpt-4o-mini'
  const label =
    mode === 'codex'
      ? 'Codex · development override'
      : mode === 'simulator'
        ? 'FireUX AI · simulator'
        : `${provider === 'openai' ? 'OpenAI' : provider || 'FireUX AI'} · ${model}`
  return label
})
</script>
