<template>
  <UPage>
    <UPageHeader
      title="Cookies and browser storage"
      description="The exact browser storage used by FireUX-powered apps and when it begins."
    />
    <UPageBody class="pagebody">
      <p class="text-sm text-muted">Last updated: October 26, 2026</p>

      <section class="space-y-3">
        <h2 class="text-lg font-semibold">No tracking storage</h2>
        <p>
          FireUX does not use analytics or advertising identifiers, device
          fingerprints, or cross-App behavioural identity. An ordinary public
          visit does not need a consent popup because optional tracking is not
          active. Nuxt remembers the appearance preference automatically,
          initially following your device. Other feature storage begins when you
          ask an App to remember a choice, sign you in, enable offline support,
          retain a cart or order, or continue a conversation.
        </p>
      </section>

      <section class="space-y-3">
        <h2 class="text-lg font-semibold">
          Appearance and requested feature storage
        </h2>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead>
              <tr>
                <th>Feature</th>
                <th>Owner and purpose</th>
                <th>Lifetime and deletion</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Appearance</td>
                <td>Nuxt remembers light, dark or System automatically.</td>
                <td>
                  Until you clear site data. Selecting System remembers that the
                  appearance should follow your device.
                </td>
              </tr>
              <tr>
                <td>Offline support</td>
                <td>
                  After you enable it, Core remembers the choice for this App,
                  registers its service worker and caches only a self-contained
                  reconnect page. Live App pages, data, API responses,
                  authentication state and queued writes are excluded.
                </td>
                <td>
                  Until you disable offline support on the
                  <NuxtLink to="/install">Install app page</NuxtLink> or clear
                  browser site data. Disabling removes the preference,
                  unregisters the App worker and deletes its cache. Open pages
                  may retain worker control until reloaded or closed; browsers
                  may also evict cached content.
                </td>
              </tr>
              <tr>
                <td>Authentication</td>
                <td>
                  Firebase maintains sign-in and security state for the current
                  App. One-hour tab values can complete a requested sign-up
                  redirect or transfer the selected anonymous Workspace target
                  after sign-in.
                </td>
                <td>
                  Across reloads and browser restarts until explicit sign-out or
                  browser site-data removal. Temporary tab values are removed
                  after completion or expiry.
                </td>
              </tr>
              <tr>
                <td>Language</td>
                <td>The current App remembers the language you select.</td>
                <td>
                  Up to one year. You can remove it with browser site-data
                  controls.
                </td>
              </tr>
              <tr>
                <td>Workspace</td>
                <td>
                  The current App remembers the authenticated Workspace source
                  and target you select.
                </td>
                <td>Browser session, or until the selection is cleared.</td>
              </tr>
              <tr>
                <td>Cart and anonymous order</td>
                <td>
                  The ordering App retains cart lines, duplicate-submission
                  protection, and the capability and receipt details needed to
                  recover the order in this browser.
                </td>
                <td>
                  At most 24 hours; removed when cleared, completed where
                  applicable, or found expired.
                </td>
              </tr>
              <tr>
                <td>Chat</td>
                <td>The current App remembers the conversation you started.</td>
                <td>
                  At most 30 days; removed when found expired or through browser
                  site-data controls.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="space-y-3">
        <h2 class="text-lg font-semibold">Third-party features</h2>
        <p>
          Google Maps loads only after you request a map. Stripe may use storage
          on its hosted checkout after you choose checkout. An embedded FireUX
          tool runs on its named provider App origin after you open that tool.
          Those providers control storage on their origins; FireUX prohibits
          joining it into cross-App behavioural profiles.
        </p>
      </section>

      <section class="space-y-3">
        <h2 class="text-lg font-semibold">Your controls</h2>
        <p>
          Browser installation is separate from offline support. The
          <NuxtLink to="/install">Install app page</NuxtLink> opens a native
          install prompt where available or shows manual browser instructions.
          Its installed status describes the current window. Offline support is
          optional, and applying an available worker update deliberately reloads
          the page after you choose Update and reload.
        </p>
        <p>
          You can use the feature controls described above or your browser's
          site-data controls. Blocking essential storage may prevent the
          requested feature from remembering its state. See the
          <NuxtLink to="/legal/privacy">Privacy Policy</NuxtLink> for
          personal-data handling, providers, rights, and contact details.
        </p>
      </section>
    </UPageBody>
  </UPage>
</template>
