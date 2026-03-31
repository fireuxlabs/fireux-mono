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
        <template v-if="authPhase === 'loading'">
          <section class="space-y-2">
            <p class="text-xs font-semibold uppercase tracking-[0.16em] text-dimmed">
              Loading Console Access
            </p>
            <p class="text-sm text-dimmed">
              Checking your sign-in state and available console routes.
            </p>
          </section>
        </template>

        <template v-else-if="showAuthSplit">
          <section v-if="showReadOnly" class="space-y-4">
            <div class="space-y-1">
              <p class="text-xs font-semibold uppercase tracking-[0.16em] text-dimmed">
                Available Without Sign-In
              </p>
              <p class="text-xs text-dimmed">
                Explore demo consoles first. Sign in when you want your own console.
              </p>
            </div>

            <section class="space-y-2">
              <p v-if="readOnlyLabel" class="text-sm font-semibold">{{ readOnlyLabel }}</p>
              <div
                v-if="showInlineNotes"
                :data-dev-note="true"
                :data-dev-note-title="readOnlyLabel || 'Demo console'"
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
              <p v-if="myLabel" class="text-sm font-semibold">{{ myLabel }}</p>
              <div
                v-if="showInlineNotes"
                :data-dev-note="true"
                :data-dev-note-title="myLabel || 'My console'"
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
            <p v-if="myLabel" class="text-sm font-semibold">{{ myLabel }}</p>
            <div
              v-if="showInlineNotes"
              :data-dev-note="true"
              :data-dev-note-title="myLabel || 'My console'"
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

          <UCollapsible v-if="collapseSecondaryModes && hasSecondaryModes">
            <UButton
              class="group"
              color="neutral"
              variant="ghost"
              label="Demo"
              icon="i-lucide-layers-2"
              trailing-icon="i-lucide-chevron-down"
              block
              :ui="{
                trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200',
              }"
            />

            <template #content>
              <div class="space-y-4 pt-3">
                <section v-if="showReadOnly" class="space-y-2">
                  <p v-if="readOnlyLabel" class="text-sm font-semibold">{{ readOnlyLabel }}</p>
                  <div
                    v-if="showInlineNotes"
                    :data-dev-note="true"
                    :data-dev-note-title="readOnlyLabel || 'Demo console'"
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
              </div>
            </template>
          </UCollapsible>

          <section v-else-if="showReadOnly" class="space-y-2">
            <p v-if="readOnlyLabel" class="text-sm font-semibold">{{ readOnlyLabel }}</p>
            <div
              v-if="showInlineNotes"
              :data-dev-note="true"
              :data-dev-note-title="readOnlyLabel || 'Demo console'"
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
        </template>

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
      </div>
    </template>

    <template #default>
      <slot />
    </template>
  </UPageCTA>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'
import { useConsoleEntryState } from '../../../composables/fireux/app/ui/useConsoleEntryState'
import { useDevUi } from '../../../composables/fireux/app/ui/useDevUi'

type ConsoleEntryClose = {
  to: string
  ariaLabel: string
}

const consoleEntryClose = inject<ConsoleEntryClose | null>(
  'fireux-console-entry-close',
  null
)

const props = withDefaults(defineProps<{
  title: string
  entity?: string
  consoleTo?: string
  myLabel: string
  readOnlyLabel: string
  learnMoreTo: string
  showMy?: boolean
  showReadOnly?: boolean
  collapseSecondaryModes?: boolean
}>(), {
  showMy: true,
  showReadOnly: true,
  collapseSecondaryModes: false,
})

const isDev = import.meta.dev
const { authPhase, showAuthSplit } = useConsoleEntryState()
const { notesVisible } = useDevUi()
const showInlineNotes = computed(() => isDev && notesVisible.value)
const hasSecondaryModes = computed(() => Boolean(props.showReadOnly))
</script>
