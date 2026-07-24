<template>
  <ClientOnly>
    <UModal
      :open="open"
      :dismissible="false"
      prevent-close
      title="Willkomme bi Interlaken Essen"
      description="Dis Misebox-Profil und dr nächscht Schritt."
      :ui="{
        overlay: 'market-onboarding-modal__overlay',
        content: 'market-onboarding-modal__content',
        header: 'sr-only',
        body: 'market-onboarding-modal__body',
      }"
    >
      <template #body>
        <article class="market-onboarding">
          <div class="market-onboarding__scene" aria-hidden="true">
            <img
              class="market-onboarding__scene-backdrop"
              src="/img/app/background.png"
              alt=""
            >
            <svg
              class="market-onboarding__linework"
              viewBox="0 0 600 230"
              fill="none"
            >
              <path d="M-18 186C72 166 112 105 173 104C221 103 250 143 289 137C333 131 351 66 414 59C474 52 521 116 620 133" />
              <path d="M-12 204C72 180 119 126 177 122C224 119 252 157 293 151C347 143 356 85 416 77C481 69 529 135 615 150" />
              <path d="M8 220C93 194 130 148 183 142C228 137 261 171 301 166C354 159 375 108 428 101C485 94 536 151 598 164" />
              <path d="M73 190C123 178 151 154 185 151C221 148 244 174 277 174" />
            </svg>
            <div class="market-onboarding__badge">
              <img src="/img/app/logo.png" alt="">
            </div>
          </div>

          <div class="market-onboarding__paper">
            <p class="market-onboarding__eyebrow">
              Interlaken &amp; Umgebung
            </p>
            <h2>Chum cho esse.</h2>
            <p class="market-onboarding__copy">
              Säg üs nume, wo du dehei bisch. Wenn du öppis Lokals aabüte
              wotsch, chasch es grad dazue säge.
            </p>

            <div
              class="market-onboarding__identity"
              :aria-label="`Signed in as ${authDisplayName || 'user'}`"
            >
              <UAvatar
                :src="authAvatarSrc"
                :alt="authDisplayName || 'Misebox user'"
                :text="authInitials"
                size="md"
                class="market-onboarding__identity-avatar"
              />
              <strong>{{ authDisplayName || 'Misebox User' }}</strong>
            </div>

            <div v-if="completed" class="market-onboarding__success">
              <UIcon name="i-lucide-check" aria-hidden="true" />
              <div>
                <strong>Merci fürs Registriere!</strong>
                <span>Du bisch jetzt bi Interlaken Essen debi.</span>
              </div>
            </div>

            <form
              v-else
              class="market-onboarding__form"
              @submit.prevent="completeOnboarding"
            >
              <fieldset class="market-onboarding__section">
                <legend>Wo bisch dehei?</legend>
                <p>Din Ort hilft üs, s Futter würkli lokal z halte.</p>

                <label class="market-onboarding__field" for="locality">
                  <span>Ort oder PLZ</span>
                  <span class="market-onboarding__select-wrap">
                    <UIcon name="i-lucide-map-pin" aria-hidden="true" />
                    <select
                      id="locality"
                      v-model="localityId"
                      required
                      :disabled="Boolean(loading)"
                    >
                      <option value="" disabled>Ort uswähle</option>
                      <option
                        v-for="locality in INTERLAKEN_LOCALITIES"
                        :key="locality.id"
                        :value="locality.id"
                      >
                        {{ locality.postalCode }} · {{ locality.label }}
                      </option>
                      <option :value="OTHER_LOCALITY_ID">
                        Öppis anders
                      </option>
                    </select>
                    <UIcon name="i-lucide-chevron-down" aria-hidden="true" />
                  </span>
                </label>

                <div
                  v-if="localityId === OTHER_LOCALITY_ID"
                  class="market-onboarding__other-locality"
                >
                  <label class="market-onboarding__field" for="locality-label">
                    <span>Ort</span>
                    <input
                      id="locality-label"
                      v-model="localityLabel"
                      type="text"
                      maxlength="80"
                      placeholder="z. B. Mürren"
                      required
                      :disabled="Boolean(loading)"
                    >
                  </label>
                  <label class="market-onboarding__field" for="postal-code">
                    <span>PLZ</span>
                    <input
                      id="postal-code"
                      v-model="postalCode"
                      type="text"
                      inputmode="numeric"
                      pattern="[0-9]{4}"
                      maxlength="4"
                      placeholder="3825"
                      required
                      :disabled="Boolean(loading)"
                    >
                  </label>
                </div>
              </fieldset>

              <fieldset class="market-onboarding__section">
                <button
                  type="button"
                  class="market-onboarding__offer-toggle"
                  role="switch"
                  :aria-checked="offersEnabled"
                  :disabled="Boolean(loading)"
                  @click="offersEnabled = !offersEnabled"
                >
                  <span>
                    <strong>Wotsch öppis aabüte?</strong>
                    <small>
                      Vom Chüelschrank bis zum Chuchi-Tisch – du bestimmisch
                      sälber, was zu dir passt.
                    </small>
                  </span>
                  <span
                    class="market-onboarding__switch"
                    :class="{ 'is-on': offersEnabled }"
                    aria-hidden="true"
                  >
                    <span />
                  </span>
                </button>

                <div
                  v-if="offersEnabled"
                  class="market-onboarding__offer-fields"
                >
                  <label class="market-onboarding__field" for="public-name">
                    <span>Name vom Agebot</span>
                    <input
                      id="public-name"
                      v-model="publicName"
                      type="text"
                      minlength="2"
                      maxlength="80"
                      placeholder="z. B. Daniels Honig"
                      required
                      :disabled="Boolean(loading)"
                    >
                  </label>

                  <label class="market-onboarding__field" for="introduction">
                    <span>Erzähl churz, was du machsch</span>
                    <textarea
                      id="introduction"
                      v-model="introduction"
                      minlength="10"
                      maxlength="280"
                      rows="3"
                      placeholder="Ganz frei – dini Produkt söue zu dir passe."
                      required
                      :disabled="Boolean(loading)"
                    />
                    <small>{{ introduction.length }}/280</small>
                  </label>
                </div>
              </fieldset>

              <div
                v-if="error"
                class="market-onboarding__error"
                role="alert"
              >
                <strong>Das het nid klappt.</strong>
                <span>{{ error }}</span>
              </div>

              <div class="market-onboarding__actions">
                <UButton
                  type="submit"
                  block
                  trailing-icon="i-lucide-arrow-right"
                  :loading="loading === 'saving'"
                  :disabled="Boolean(loading) || !formIsValid"
                  class="market-onboarding__submit"
                >
                  Fertig
                </UButton>
                <UButton
                  type="button"
                  block
                  variant="ghost"
                  color="neutral"
                  :loading="loading === 'skipped'"
                  :disabled="Boolean(loading)"
                  class="market-onboarding__skip"
                  @click="skipOnboarding"
                >
                  Für itz überspringe
                </UButton>
              </div>
            </form>
          </div>
        </article>
      </template>
    </UModal>
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from '#imports'
import { useAvatarProxy } from 'fireux-core/runtime/composables/fireux/app/ui/useAvatarProxy'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import {
  INTERLAKEN_LOCALITIES,
  OTHER_LOCALITY_ID,
  type InterlakenLocalityId,
  type MarketplaceOnboardingInput,
} from '../../content/marketplace-profile'

const { authState, currentUser: authUser } = useAuth()
const {
  appUser,
  appPending,
  appOutcome,
  avatarSrc,
  app: appUpdates,
} = useUser()
const { membership } = appUpdates
const { getProxiedAvatarUrl } = useAvatarProxy()

const localityId = ref<InterlakenLocalityId | ''>('')
const localityLabel = ref('')
const postalCode = ref('')
const offersEnabled = ref(false)
const publicName = ref('')
const introduction = ref('')
const loading = ref<'' | 'saving' | 'skipped'>('')
const error = ref('')
const dismissed = ref(false)
const completed = ref(false)
const readyToCheck = ref(false)
let readinessTimer: ReturnType<typeof setTimeout> | undefined
let completionTimer: ReturnType<typeof setTimeout> | undefined

onMounted(() => {
  readinessTimer = window.setTimeout(() => {
    readyToCheck.value = true
  }, 600)
})

onUnmounted(() => {
  if (readinessTimer) window.clearTimeout(readinessTimer)
  if (completionTimer) window.clearTimeout(completionTimer)
})

const isPendingOnboarding = computed(() => {
  if (authState.value !== 'AUTHENTICATED') return false
  if (!readyToCheck.value) return false
  if (appPending.value) return false

  const status = appUser.value?.onboarding_status
  if (status === 'completed' || status === 'skipped') return false
  if (appOutcome.value === 'missing') return false

  // A returning member must not lose onboarding merely because the optional
  // client projection resolved late or failed. The trusted submit action still
  // verifies and updates the authenticated user's canonical membership.
  return true
})

const open = computed(() => !dismissed.value && isPendingOnboarding.value)

const authDisplayName = computed(() =>
  String(authUser.value?.displayName || '').trim()
)
const authInitials = computed(() => {
  const parts = authDisplayName.value.split(/\s+/).filter(Boolean)
  if (!parts.length) return 'U'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase() || 'U'
})
const authAvatarSrc = computed(() => {
  const authSource =
    typeof authUser.value?.photoURL === 'string'
      ? authUser.value.photoURL.trim()
      : ''
  return getProxiedAvatarUrl(avatarSrc.value || authSource || undefined)
})

const formIsValid = computed(() => {
  if (!localityId.value) return false
  if (
    localityId.value === OTHER_LOCALITY_ID &&
    (localityLabel.value.trim().length < 2 ||
      !/^\d{4}$/.test(postalCode.value.trim()))
  ) {
    return false
  }
  if (!offersEnabled.value) return true
  return (
    publicName.value.trim().length >= 2 &&
    introduction.value.trim().length >= 10
  )
})

watch(offersEnabled, (enabled) => {
  if (enabled && !publicName.value.trim()) {
    publicName.value = authDisplayName.value
  }
})

async function completeOnboarding() {
  if (loading.value || !formIsValid.value) return
  const user = authUser.value
  if (!user) {
    error.value = 'Mir hei dini Amäldig verlore. Bitte lad d Site neu.'
    return
  }

  error.value = ''
  loading.value = 'saving'

  const body: MarketplaceOnboardingInput = {
    locality_id: localityId.value as InterlakenLocalityId,
    offers_enabled: offersEnabled.value,
    ...(localityId.value === OTHER_LOCALITY_ID
      ? {
          locality_label: localityLabel.value.trim(),
          postal_code: postalCode.value.trim(),
        }
      : {}),
    ...(offersEnabled.value
      ? {
          public_name: publicName.value.trim(),
          introduction: introduction.value.trim(),
        }
      : {}),
  }

  try {
    const token = await user.getIdToken()
    await $fetch('/api/onboarding/profile', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body,
    })
    completed.value = true
    completionTimer = window.setTimeout(() => {
      dismissed.value = true
    }, 1600)
  } catch {
    error.value =
      'D Registrierig het nid chönne gspeicheret wärde. Probier es bitte no einisch.'
  } finally {
    loading.value = ''
  }
}

async function skipOnboarding() {
  if (loading.value) return

  error.value = ''
  loading.value = 'skipped'

  try {
    await membership.setOnboardingStatus('skipped')
    dismissed.value = true
  } catch (cause) {
    error.value =
      cause instanceof Error && cause.message.trim()
        ? cause.message
        : 'D Registrierig het nid chönne gspeicheret wärde.'
  } finally {
    loading.value = ''
  }
}
</script>

<style scoped>
:global(.market-onboarding-modal__overlay) {
  background: rgba(9, 32, 29, 0.72);
  backdrop-filter: blur(0.45rem) saturate(0.85);
}

:global(.market-onboarding-modal__content) {
  width: min(34rem, calc(100vw - 1.5rem));
  max-width: 34rem;
  max-height: calc(100dvh - 1.5rem);
  overflow: hidden;
  border: 1px solid rgba(251, 243, 223, 0.78);
  border-radius: 1.35rem;
  background: #fbf3df;
  box-shadow:
    0 2rem 6rem rgba(4, 23, 21, 0.5),
    0 0 0 0.35rem rgba(23, 53, 43, 0.3);
}

:global(.market-onboarding-modal__body) {
  overflow-x: hidden;
  overflow-y: auto;
  padding: 0;
}

.market-onboarding {
  color: #17352b;
}

.market-onboarding__scene {
  position: relative;
  min-height: 12.5rem;
  overflow: hidden;
  background: #2f6a50;
}

.market-onboarding__scene-backdrop {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 43%;
}

.market-onboarding__scene::after {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(250, 203, 79, 0.24), transparent 48%),
    linear-gradient(0deg, rgba(23, 53, 43, 0.38), transparent 55%);
  content: "";
}

.market-onboarding__linework {
  position: absolute;
  z-index: 2;
  right: -2%;
  bottom: -0.1rem;
  left: -2%;
  width: 104%;
  height: auto;
  opacity: 0.84;
  stroke: #fbf3df;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.4;
  vector-effect: non-scaling-stroke;
}

.market-onboarding__badge {
  position: absolute;
  z-index: 3;
  bottom: 1rem;
  left: 1.25rem;
  overflow: hidden;
  width: 4.3rem;
  height: 4.3rem;
  border: 2px solid #fbf3df;
  border-radius: 50%;
  background: #fbf3df;
  box-shadow: 0 0.5rem 1.5rem rgba(4, 23, 21, 0.35);
}

.market-onboarding__badge img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.market-onboarding__paper {
  position: relative;
  padding: 1.45rem clamp(1.35rem, 5vw, 2.25rem) 1.6rem;
  background:
    radial-gradient(circle at 100% 0, rgba(244, 198, 83, 0.22), transparent 35%),
    #fbf3df;
}

.market-onboarding__paper::before {
  display: block;
  width: 2.8rem;
  height: 0.28rem;
  margin-bottom: 0.85rem;
  border-radius: 999px;
  background: #cf4438;
  content: "";
  transform: rotate(-3deg);
}

.market-onboarding__eyebrow {
  margin: 0 0 0.3rem;
  color: #2f6a50;
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.market-onboarding h2 {
  margin: 0;
  color: #17352b;
  font-family: var(--market-display);
  font-size: clamp(2.8rem, 10vw, 4.5rem);
  font-weight: 950;
  letter-spacing: -0.045em;
  line-height: 0.88;
  text-transform: uppercase;
}

.market-onboarding__copy {
  max-width: 27rem;
  margin: 1rem 0 0;
  color: rgba(23, 53, 43, 0.82);
  font-size: 1rem;
  font-weight: 650;
  line-height: 1.5;
}

.market-onboarding__error {
  display: grid;
  gap: 0.15rem;
  margin-top: 1rem;
  border-left: 0.25rem solid #cf4438;
  padding: 0.65rem 0.8rem;
  background: rgba(207, 68, 56, 0.09);
  color: #6f281f;
  font-size: 0.82rem;
}

.market-onboarding__identity {
  display: inline-flex;
  max-width: 100%;
  gap: 0.65rem;
  align-items: center;
  margin-top: 1.2rem;
  border: 1px solid rgba(23, 53, 43, 0.2);
  border-radius: 999px;
  padding: 0.35rem 0.85rem 0.35rem 0.35rem;
  background: rgba(255, 252, 241, 0.62);
  box-shadow: 0 0.35rem 1.2rem rgba(23, 53, 43, 0.08);
}

:deep(.market-onboarding__identity-avatar) {
  flex: none;
  box-shadow: 0 0 0 1px rgba(23, 53, 43, 0.35);
}

.market-onboarding__identity strong {
  overflow: hidden;
  color: #17352b;
  font-size: 0.88rem;
  font-weight: 850;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.market-onboarding__form {
  display: grid;
  gap: 0.8rem;
  margin-top: 1rem;
}

.market-onboarding__section {
  display: grid;
  min-width: 0;
  gap: 0.65rem;
  margin: 0;
  border: 1px solid rgba(23, 53, 43, 0.18);
  border-radius: 1rem;
  padding: 0.9rem;
  background:
    linear-gradient(135deg, rgba(255, 252, 241, 0.86), rgba(244, 198, 83, 0.09));
  box-shadow: 0 0.45rem 1.4rem rgba(23, 53, 43, 0.06);
}

.market-onboarding__section legend {
  padding: 0 0.35rem;
  color: #17352b;
  font-family: var(--market-display);
  font-size: 1.2rem;
  font-weight: 950;
  letter-spacing: -0.02em;
}

.market-onboarding__section > p {
  margin: -0.25rem 0 0;
  color: rgba(23, 53, 43, 0.66);
  font-size: 0.78rem;
  font-weight: 650;
  line-height: 1.4;
}

.market-onboarding__field {
  display: grid;
  min-width: 0;
  gap: 0.35rem;
}

.market-onboarding__field > span:first-child {
  color: #2f6a50;
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.market-onboarding__field input,
.market-onboarding__field select,
.market-onboarding__field textarea {
  width: 100%;
  border: 1px solid rgba(23, 53, 43, 0.28);
  border-radius: 0.72rem;
  outline: none;
  padding: 0.72rem 0.78rem;
  background: rgba(255, 252, 241, 0.92);
  color: #17352b;
  font: inherit;
  font-size: 0.9rem;
  font-weight: 720;
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease,
    background 160ms ease;
}

.market-onboarding__field input::placeholder,
.market-onboarding__field textarea::placeholder {
  color: rgba(23, 53, 43, 0.43);
}

.market-onboarding__field input:focus,
.market-onboarding__field select:focus,
.market-onboarding__field textarea:focus {
  border-color: #cf4438;
  background: #fffdf5;
  box-shadow: 0 0 0 0.2rem rgba(207, 68, 56, 0.12);
}

.market-onboarding__field textarea {
  min-height: 5.7rem;
  line-height: 1.45;
  resize: vertical;
}

.market-onboarding__field > small {
  justify-self: end;
  margin-top: -0.2rem;
  color: rgba(23, 53, 43, 0.52);
  font-size: 0.68rem;
  font-weight: 750;
}

.market-onboarding__select-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.market-onboarding__select-wrap > svg:first-child {
  position: absolute;
  z-index: 1;
  left: 0.75rem;
  width: 1rem;
  height: 1rem;
  color: #cf4438;
  pointer-events: none;
}

.market-onboarding__select-wrap select {
  appearance: none;
  padding-right: 2.4rem;
  padding-left: 2.2rem;
}

.market-onboarding__select-wrap > svg:last-child {
  position: absolute;
  right: 0.75rem;
  width: 1rem;
  height: 1rem;
  color: #2f6a50;
  pointer-events: none;
}

.market-onboarding__other-locality {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 5.5rem;
  gap: 0.65rem;
}

.market-onboarding__offer-toggle {
  display: flex;
  width: 100%;
  gap: 0.85rem;
  align-items: center;
  justify-content: space-between;
  border: 0;
  padding: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.market-onboarding__offer-toggle:disabled {
  cursor: wait;
  opacity: 0.65;
}

.market-onboarding__offer-toggle:focus {
  outline: none;
}

.market-onboarding__offer-toggle:focus-visible {
  border-radius: 0.45rem;
  outline: 0.15rem solid rgba(207, 68, 56, 0.7);
  outline-offset: 0.25rem;
}

.market-onboarding__offer-toggle > span:first-child {
  display: grid;
  min-width: 0;
  gap: 0.18rem;
}

.market-onboarding__offer-toggle strong {
  color: #17352b;
  font-size: 0.98rem;
  font-weight: 900;
}

.market-onboarding__offer-toggle small {
  max-width: 23rem;
  color: rgba(23, 53, 43, 0.65);
  font-size: 0.74rem;
  font-weight: 620;
  line-height: 1.38;
}

.market-onboarding__switch {
  position: relative;
  flex: none;
  width: 3.1rem;
  height: 1.75rem;
  border: 1px solid rgba(23, 53, 43, 0.3);
  border-radius: 999px;
  background: rgba(23, 53, 43, 0.12);
  box-shadow: inset 0 0.15rem 0.35rem rgba(23, 53, 43, 0.12);
  transition:
    border-color 180ms ease,
    background 180ms ease;
}

.market-onboarding__switch > span {
  position: absolute;
  top: 0.2rem;
  left: 0.2rem;
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 46% 54% 52% 48%;
  background: #fbf3df;
  box-shadow: 0 0.15rem 0.35rem rgba(23, 53, 43, 0.28);
  transition: transform 180ms ease;
  transform: rotate(-8deg);
}

.market-onboarding__switch.is-on {
  border-color: #2f6a50;
  background: #2f6a50;
}

.market-onboarding__switch.is-on > span {
  transform: translateX(1.35rem) rotate(8deg);
}

.market-onboarding__offer-fields {
  display: grid;
  gap: 0.7rem;
  border-top: 1px solid rgba(23, 53, 43, 0.14);
  padding-top: 0.8rem;
  animation: market-onboarding-reveal 180ms ease both;
}

.market-onboarding__success {
  display: flex;
  gap: 0.8rem;
  align-items: center;
  margin-top: 1rem;
  border: 1px solid rgba(47, 106, 80, 0.28);
  border-radius: 1rem;
  padding: 1rem;
  background: rgba(47, 106, 80, 0.1);
  color: #17352b;
}

.market-onboarding__success > svg {
  flex: none;
  width: 1.5rem;
  height: 1.5rem;
  color: #2f6a50;
}

.market-onboarding__success > div {
  display: grid;
  gap: 0.12rem;
}

.market-onboarding__success strong {
  font-size: 0.95rem;
  font-weight: 900;
}

.market-onboarding__success span {
  color: rgba(23, 53, 43, 0.72);
  font-size: 0.8rem;
  font-weight: 650;
}

.market-onboarding__actions {
  display: grid;
  gap: 0.45rem;
  margin-top: 0.1rem;
}

:deep(.market-onboarding__submit) {
  min-height: 2.85rem;
  border-radius: 0.8rem;
  background: #cf4438;
  color: #fff8e8;
  font-weight: 900;
  box-shadow: 0 0.55rem 1.2rem rgba(128, 43, 34, 0.2);
}

:deep(.market-onboarding__submit:hover:not(:disabled)) {
  background: #b83b31;
}

:deep(.market-onboarding__submit:disabled) {
  background: rgba(23, 53, 43, 0.2);
  color: rgba(23, 53, 43, 0.48);
  box-shadow: none;
}

:deep(.market-onboarding__skip) {
  color: rgba(23, 53, 43, 0.7);
  font-weight: 800;
}

@keyframes market-onboarding-reveal {
  from {
    opacity: 0;
    transform: translateY(-0.35rem);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 40rem) {
  .market-onboarding__scene {
    min-height: 10.5rem;
  }

  .market-onboarding__badge {
    width: 3.65rem;
    height: 3.65rem;
  }

  .market-onboarding h2 {
    font-size: clamp(2.65rem, 15vw, 4rem);
  }

  .market-onboarding__paper {
    padding-right: 1.15rem;
    padding-left: 1.15rem;
  }
}
</style>
