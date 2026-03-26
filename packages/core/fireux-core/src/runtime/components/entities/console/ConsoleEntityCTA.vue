<template>
  <UPageCTA :title="title" orientation="horizontal">
    <template #top>
      <div
        v-if="consoleEntryClose"
        class="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-end p-3 sm:p-4"
      >
        <UButton
          :to="consoleEntryClose.to"
          icon="i-lucide-x-circle"
          color="neutral"
          variant="ghost"
          :aria-label="consoleEntryClose.ariaLabel"
          class="pointer-events-auto"
        />
      </div>
    </template>

    <template #header>
      <div class="space-y-4">
        <h2 class="text-pretty text-3xl font-semibold tracking-tight text-highlighted sm:text-4xl lg:text-5xl">
          {{ title }}
        </h2>
      </div>
    </template>

    <template #links>
      <div class="space-y-4">
        <template v-if="showAuthSplit">
          <section class="space-y-4">
            <div class="space-y-1">
              <p class="text-xs font-semibold uppercase tracking-[0.16em] text-dimmed">
                Available Without Sign-In
              </p>
              <p class="text-xs text-dimmed">
                Explore read-only and test spaces first. Sign in only when you want your own console or to save progress.
              </p>
            </div>

            <section v-if="showTest" class="space-y-2">
              <p class="text-sm font-semibold">{{ testLabel }}</p>
              <div
                v-if="showInlineNotes"
                :data-dev-note="true"
                :data-dev-note-title="testLabel"
                class="fireux-dev-note rounded-lg px-3 py-2 text-xs text-dimmed"
              >
                <p class="fireux-dev-note__label mb-1 text-[11px] font-semibold uppercase tracking-[0.16em]">
                  Developer Note
                </p>
                <ul data-dev-note-body class="list-disc space-y-1 pl-4">
                  <li v-if="consoleTo">
                    Routes to
                    <code>{{ consoleTo }}</code>.
                  </li>
                  <li>
                    Sets runtime mode to
                    <code>test</code>.
                  </li>
                  <slot name="testNote" />
                </ul>
              </div>
              <slot name="test" />
            </section>

            <section v-if="showReadOnly" class="space-y-2">
              <p class="text-sm font-semibold">{{ readOnlyLabel }}</p>
              <div
                v-if="showInlineNotes"
                :data-dev-note="true"
                :data-dev-note-title="readOnlyLabel"
                class="fireux-dev-note rounded-lg px-3 py-2 text-xs text-dimmed"
              >
                <p class="fireux-dev-note__label mb-1 text-[11px] font-semibold uppercase tracking-[0.16em]">
                  Developer Note
                </p>
                <ul data-dev-note-body class="list-disc space-y-1 pl-4">
                  <li v-if="consoleTo">
                    Routes to
                    <code>{{ consoleTo }}</code>.
                  </li>
                  <li>
                    Sets runtime mode to
                    <code>read-only</code>.
                  </li>
                  <slot name="readOnlyNote" />
                </ul>
              </div>
              <slot name="readOnly" />
            </section>

            <section class="space-y-2">
              <div
                v-if="showInlineNotes"
                data-dev-note="true"
                data-dev-note-title="Learn more"
                class="fireux-dev-note rounded-lg px-3 py-2 text-xs text-dimmed"
              >
                <p class="fireux-dev-note__label mb-1 text-[11px] font-semibold uppercase tracking-[0.16em]">
                  Developer Note
                </p>
                <ul data-dev-note-body class="list-disc space-y-1 pl-4">
                  <li>
                    Routes to
                    <code>{{ learnMoreTo }}</code>.
                  </li>
                  <slot name="learnMoreNote" />
                </ul>
              </div>
              <UButton
                block
                variant="subtle"
                color="primary"
                icon="i-lucide-book-open"
                :to="learnMoreTo"
              >
                Learn more
              </UButton>
            </section>
          </section>

          <section v-if="showMy" class="space-y-4 border-t border-default pt-4">
            <div class="space-y-1">
              <p class="text-xs font-semibold uppercase tracking-[0.16em] text-dimmed">
                Requires Sign-In
              </p>
              <p class="text-xs text-dimmed">
                Your consoles and create flows live here.
              </p>
            </div>

            <section class="space-y-2">
              <p class="text-sm font-semibold">{{ myLabel }}</p>
              <div
                v-if="showInlineNotes"
                :data-dev-note="true"
                :data-dev-note-title="myLabel"
                class="fireux-dev-note rounded-lg px-3 py-2 text-xs text-dimmed"
              >
                <p class="fireux-dev-note__label mb-1 text-[11px] font-semibold uppercase tracking-[0.16em]">
                  Developer Note
                </p>
                <ul data-dev-note-body class="list-disc space-y-1 pl-4">
                  <li v-if="consoleTo">
                    Routes to
                    <code>{{ consoleTo }}</code>.
                  </li>
                  <li>
                    Sets runtime mode to
                    <code>live</code>.
                  </li>
                  <slot name="myNote" />
                </ul>
              </div>
              <slot name="my" />
            </section>
          </section>
        </template>

        <template v-else>
          <section v-if="showMy" class="space-y-2">
            <p class="text-sm font-semibold">{{ myLabel }}</p>
            <div
              v-if="showInlineNotes"
              :data-dev-note="true"
              :data-dev-note-title="myLabel"
              class="fireux-dev-note rounded-lg px-3 py-2 text-xs text-dimmed"
            >
              <p class="fireux-dev-note__label mb-1 text-[11px] font-semibold uppercase tracking-[0.16em]">
                Developer Note
              </p>
              <ul data-dev-note-body class="list-disc space-y-1 pl-4">
                <li v-if="consoleTo">
                  Routes to
                  <code>{{ consoleTo }}</code>.
                </li>
                <li>
                  Sets runtime mode to
                  <code>live</code>.
                </li>
                <slot name="myNote" />
              </ul>
            </div>
            <slot name="my" />
          </section>

          <section v-if="showTest" class="space-y-2">
            <p class="text-sm font-semibold">{{ testLabel }}</p>
            <div
              v-if="showInlineNotes"
              :data-dev-note="true"
              :data-dev-note-title="testLabel"
              class="fireux-dev-note rounded-lg px-3 py-2 text-xs text-dimmed"
            >
              <p class="fireux-dev-note__label mb-1 text-[11px] font-semibold uppercase tracking-[0.16em]">
                Developer Note
              </p>
              <ul data-dev-note-body class="list-disc space-y-1 pl-4">
                <li v-if="consoleTo">
                  Routes to
                  <code>{{ consoleTo }}</code>.
                </li>
                <li>
                  Sets runtime mode to
                  <code>test</code>.
                </li>
                <slot name="testNote" />
              </ul>
            </div>
            <slot name="test" />
          </section>

          <section v-if="showReadOnly" class="space-y-2">
            <p class="text-sm font-semibold">{{ readOnlyLabel }}</p>
            <div
              v-if="showInlineNotes"
              :data-dev-note="true"
              :data-dev-note-title="readOnlyLabel"
              class="fireux-dev-note rounded-lg px-3 py-2 text-xs text-dimmed"
            >
              <p class="fireux-dev-note__label mb-1 text-[11px] font-semibold uppercase tracking-[0.16em]">
                Developer Note
              </p>
              <ul data-dev-note-body class="list-disc space-y-1 pl-4">
                <li v-if="consoleTo">
                  Routes to
                  <code>{{ consoleTo }}</code>.
                </li>
                <li>
                  Sets runtime mode to
                  <code>read-only</code>.
                </li>
                <slot name="readOnlyNote" />
              </ul>
            </div>
            <slot name="readOnly" />
          </section>

          <section class="space-y-2">
            <div
              v-if="showInlineNotes"
              data-dev-note="true"
              data-dev-note-title="Learn more"
              class="fireux-dev-note rounded-lg px-3 py-2 text-xs text-dimmed"
            >
              <p class="fireux-dev-note__label mb-1 text-[11px] font-semibold uppercase tracking-[0.16em]">
                Developer Note
              </p>
              <ul data-dev-note-body class="list-disc space-y-1 pl-4">
                <li>
                  Routes to
                  <code>{{ learnMoreTo }}</code>.
                </li>
                <slot name="learnMoreNote" />
              </ul>
            </div>
            <UButton
              block
              variant="subtle"
              color="primary"
              icon="i-lucide-book-open"
              :to="learnMoreTo"
            >
              Learn more
            </UButton>
          </section>
        </template>
      </div>
    </template>

    <template #default>
      <slot />
    </template>
  </UPageCTA>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'
import { useAuth } from '../../../composables/fireux/firebase/useAuth'
import { useDevUi } from '../../../composables/fireux/app/ui/useDevUi'

type ConsoleEntryClose = {
  to: string
  ariaLabel: string
}

const consoleEntryClose = inject<ConsoleEntryClose | null>(
  'fireux-console-entry-close',
  null
)

withDefaults(defineProps<{
  title: string
  entity?: string
  consoleTo?: string
  myLabel: string
  testLabel: string
  readOnlyLabel: string
  learnMoreTo: string
  showMy?: boolean
  showTest?: boolean
  showReadOnly?: boolean
}>(), {
  showMy: true,
  showTest: true,
  showReadOnly: true,
})

const isDev = import.meta.dev
const { isAuthenticated } = useAuth()
const { notesVisible } = useDevUi()
const showInlineNotes = computed(() => isDev && notesVisible.value)
const showAuthSplit = computed(() => !isAuthenticated.value)
</script>
