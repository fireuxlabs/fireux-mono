<template>
  <div v-if="visibleLanguageOptions.length > 1" class="sproochli-trigger">
    <button
      type="button"
      class="sproochli-trigger-button"
      :aria-label="triggerLabel"
      :title="triggerLabel"
      @click="open = true"
    >
      <img
        :src="triggerImageSrc"
        alt=""
        class="sproochli-trigger-image"
        loading="lazy"
        decoding="async"
      >
      <span class="sr-only">{{ triggerLabel }}</span>
    </button>

    <span class="sproochli-trigger-current">
      {{ selectedOption.name }}
    </span>

    <ClientOnly>
      <Teleport to="body">
        <div
          v-if="open"
          class="sproochli-modal-backdrop"
          @click.self="open = false"
        >
          <section
            class="sproochli-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="sproochli-language-title"
          >
            <header class="sproochli-modal-header">
              <div>
                <h2 id="sproochli-language-title">Translate with Sproochli</h2>
                <p>Choose a menu language.</p>
              </div>
              <button
                type="button"
                class="sproochli-modal-close"
                aria-label="Close language picker"
                @click="open = false"
              >
                <UIcon name="i-lucide-x" />
              </button>
            </header>

            <div class="sproochli-language-list">
              <a
                v-for="option in visibleLanguageOptions"
                :key="option.code || 'original'"
                :href="languageHref(option.code)"
                class="sproochli-language-option"
                :class="{ 'is-active': languageOptionActive(option.code) }"
                :aria-current="languageOptionActive(option.code) ? 'page' : undefined"
                :dir="languageDirection(option.code)"
                @click="open = false"
              >
                <span class="sproochli-language-mark">{{ option.label }}</span>
                <span class="sproochli-language-name">{{ option.name }}</span>
                <UIcon
                  v-if="languageOptionActive(option.code)"
                  name="i-lucide-check"
                  class="sproochli-language-check"
                />
              </a>
            </div>
          </section>
        </div>
      </Teleport>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from '#imports'
import {
  isPublicKitchenRtlLanguage,
  type PublicKitchenLanguageCode,
  type PublicKitchenLanguageOption,
} from '../../composables/fireux/public/kitchen/sproochli/publicLanguage'

const triggerImageSrc = new URL(
  '../../../assets/sproochli/translate-trigger-compact.png',
  import.meta.url
).href

const props = defineProps<{
  languageOptions: PublicKitchenLanguageOption[]
  selectedLanguage?: PublicKitchenLanguageCode
}>()

const route = useRoute()
const open = ref(false)
const visibleLanguageOptions = computed(() => props.languageOptions ?? [])
const selectedOption = computed(
  () =>
    visibleLanguageOptions.value.find(
      (option) => option.code === (props.selectedLanguage || '')
    ) ??
    visibleLanguageOptions.value[0] ?? {
      code: '',
      label: 'Original',
      name: 'Original',
    }
)
const triggerLabel = computed(
  () => `Translate with Sproochli. Current language: ${selectedOption.value.name}.`
)
const passThroughQuery = computed(() =>
  Object.fromEntries(
    Object.entries(route.query).filter(
      ([key]) => !['sproochli', 'lang', 'language'].includes(key)
    )
  )
)

const appendQueryValue = (
  params: URLSearchParams,
  key: string,
  value: unknown
) => {
  if (Array.isArray(value)) {
    value.forEach((entry) => appendQueryValue(params, key, entry))
    return
  }
  const normalized = String(value ?? '').trim()
  if (normalized) params.append(key, normalized)
}

const languageHref = (language: PublicKitchenLanguageCode) => {
  const params = new URLSearchParams()
  Object.entries(passThroughQuery.value).forEach(([key, value]) => {
    appendQueryValue(params, key, value)
  })
  if (language) params.set('sproochli', language)
  const query = params.toString()
  return query ? `${route.path}?${query}` : route.path
}
const languageOptionActive = (language: PublicKitchenLanguageCode) =>
  language
    ? language === (props.selectedLanguage || '')
    : !props.selectedLanguage
const languageDirection = (language: PublicKitchenLanguageCode) =>
  isPublicKitchenRtlLanguage(language) ? 'rtl' : 'ltr'
</script>

<style scoped>
.sproochli-trigger {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
}

.sproochli-trigger-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: min(42vw, 142px);
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.sproochli-trigger-button:focus-visible {
  outline: 2px solid var(--ui-primary);
  outline-offset: 3px;
}

.sproochli-trigger-image {
  display: block;
  width: 100%;
  height: auto;
}

.sproochli-trigger-current {
  color: var(--ui-text-muted);
  font-size: 0.85rem;
  font-weight: 650;
}

.sproochli-language-list {
  display: grid;
  gap: 0.5rem;
}

.sproochli-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.48);
}

.sproochli-modal {
  width: min(100%, 460px);
  max-height: min(720px, calc(100vh - 2rem));
  overflow: auto;
  padding: 1rem;
  border: 1px solid var(--ui-border);
  border-radius: 8px;
  background: var(--ui-bg);
  color: var(--ui-text);
  box-shadow: var(--ui-shadow-xl, 0 24px 60px rgba(0, 0, 0, 0.28));
}

.sproochli-modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.sproochli-modal-header h2 {
  margin: 0;
  color: var(--ui-text-highlighted);
  font-size: 1rem;
  font-weight: 750;
}

.sproochli-modal-header p {
  margin: 0.2rem 0 0;
  color: var(--ui-text-muted);
  font-size: 0.9rem;
}

.sproochli-modal-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: 1px solid var(--ui-border);
  border-radius: 999px;
  background: transparent;
  color: var(--ui-text-muted);
  cursor: pointer;
}

.sproochli-language-option {
  display: grid;
  grid-template-columns: minmax(3.5rem, auto) 1fr auto;
  align-items: center;
  gap: 0.75rem;
  min-height: 3rem;
  padding: 0.75rem 0.85rem;
  border: 1px solid var(--ui-border);
  border-radius: 8px;
  color: var(--ui-text);
  text-decoration: none;
}

.sproochli-language-option:hover,
.sproochli-language-option.is-active {
  border-color: var(--ui-primary);
  background: color-mix(in srgb, var(--ui-primary) 10%, transparent);
}

.sproochli-language-mark {
  color: var(--ui-text-highlighted);
  font-size: 1.05rem;
  font-weight: 750;
}

.sproochli-language-name {
  color: var(--ui-text-highlighted);
  font-size: 0.95rem;
  font-weight: 650;
}

.sproochli-language-check {
  color: var(--ui-primary);
}
</style>
