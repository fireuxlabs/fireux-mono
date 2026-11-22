# Native live API read fixture

This controlled harness runs two real Nuxt Apps against one local demo Firebase
project. Kitchen uses the existing `useKitchens` consumer and Kitchen API adapter.
Project uses the existing Workspace, Workspace Team and Team summary consumers,
plus the FireUX App's real Team GET and command adapters. Core's Firebase module,
`useApiRead`, native `useAsyncData`, bearer verification, feed and Admin listeners
are exercised directly. The small fixture presentation exposes their state.
Kitchen also mounts the actual `useMenu` reader through the real Menu adapter,
using the Kitchen owner's canonical published specials seed recipe. The reusable
Item stays in `dishes`; the dated Section's placement stores only its reference.

The fixture is shared verification tooling, outside package compilation. It
generates Apps and Firebase configuration under
`/private/tmp/fireux-live-api-fixture`; it never reads an App's `.env`. The runner
passes a small environment allowlist, explicit emulator hosts and the demo
project `demo-fireux-live`. Fixture control/seed code rejects other hosts or
projects. No deployed data, Rules, provider or App configuration is changed.

## Start and ownership

Use one operator for the emulator and both App processes. Each foreground command
owns its child process and forwards termination signals. Start the emulator first
because the installed Nuxt VueFire module detects the emulator hub at startup.
The runner opts fixture Apps in with `VUEFIRE_EMULATORS=true`. Other FireUX
Apps keep their configured Firebase services while the hub is running. Start
normal previews without the opt-in or SDK emulator host variables.
The runner uses task-local Java settings and needs the existing JRE at
`/opt/homebrew/opt/openjdk@25/libexec/openjdk.jdk/Contents/Home`.

From the repository root:

```sh
node tools/ide/fixtures/live-api/run.mjs prepare
node tools/ide/fixtures/live-api/run.mjs emulators
# In another terminal, after Auth and Firestore report ready:
node tools/ide/fixtures/live-api/run.mjs seed 10
node tools/ide/fixtures/live-api/run.mjs kitchen
# In another terminal:
node tools/ide/fixtures/live-api/run.mjs project
```

Ports: Kitchen `3141`, Project `3142`, Firestore `8181`, Auth `9199`, emulator hub
`4400`, logging `4500`, Firestore websocket `9151`. Check ownership before starting
these processes. The emulator runner invokes `npx -y firebase-tools@latest`; the
App runners use the repository's installed Nuxt CLI. Nothing is installed in the
repository. Repeat `prepare` after changing fixture templates; it does not remove
generated Nuxt state. Stop an App before replacing its templates.

Use independent browser profiles or contexts for the changing and observing
browsers. The fixture actor is `actor@fixture.test` with the synthetic password
`fixture-password-123`; the UI supplies these through the real Auth composable.
Kitchen public rendering requires no protected session. Project Team requires
the seeded canonical App membership and lifetime-bound Project grant.

## Inspect behavior

Kitchen mounts a directory, a reactive exact-Place reader and nine other distinct
exact-Place readers. With the named-database probe this exceeds six channels.
Inspect the network to confirm one feed connection per browser App and continued
ordinary JSON reads. Confirm SSR HTML contains Kitchen names and hydration does
not issue duplicate initial Kitchen JSON requests.

The canonical special is `kitchens/place-000/menus/special-menu`, with slug
`specials` and a published selection for `2099-11-23`. This future date exercises
the existing next-published-special rule without depending on the operator's
current date. `useMenu('specials', …)` reads its actual directory route scope.
The `menu-manifest` element displays the returned safe manifest, including Daily
date/publication, Item identity, price, choices and presentation currency.
The `directory-special-place-000` and `selected-special-place-000` elements
display the same Item through the actual Kitchen special preview. Place currency
uses `default_currency_code`; Kitchen identity includes active status and public
visibility. The existing exact Offering query is empty in this minimum browse
fixture; no ordinary service or order capability is implied.

Use one browser's controls while watching another:

- Change Kitchen name; both its exact reader and directory must update.
- Change the private Kitchen field; native comparison may run, but an unchanged
  safe DTO must not trigger another browser JSON read or expose the private marker.
- Burst Kitchen names; the final value must arrive. Record comparison and JSON
  counts instead of assuming one evaluation for all commits.
- Change Item price and options: canonical `dishes/roll` changes from price `25`
  to `27`, and its `Extra aioli` option changes from `2` to `3`. Both the Menu
  manifest and Kitchen special preview must update from the same reusable Item.
  The placement must not gain copied price, name, image or choice fields.
- Change the private Item field; neither DTO nor the DOM may expose the Item,
  Menu or Kitchen private marker. An unchanged safe DTO must not cause another
  browser JSON read.
- Withdraw the special date; the Kitchen preview disappears and the canonical
  Menu reports an unpublished date with no Sections. Unpublish the Menu itself;
  the actual detail request must return `404`. Restore publication and confirm
  recovery in both readers without a reload.
- Set the local Item image while image display is disabled; the Kitchen preview
  keeps its image empty. Enable Item images and verify the preview receives the
  local image and the canonical Menu's presentation opts in. Disable it again.
  The only fixture image is the local `/fixture-item.svg`; no remote asset or
  provider request is required.
- Change Place currency to EUR, then reset to CHF; both the Menu presentation
  and special preview must follow the canonical Place field. Existing Change
  Kitchen name controls similarly exercise the Place-owned venue name.
- Switch Kitchen scope; the selected reader must drop its old scope and show only
  the new Place. Toggle consumers off and confirm all feed listeners are released.
- Sign in on Project, select Project A, and create a Team member through the real
  command. Both the Workspace Team and summary must update in the other browser.
- Change the linked identity; Team names must update from named `live-identity`.
  Changing the same User path in named `fireux` must not change that identity.
- Revoke the Project grant; protected rows must disappear. Restore it and verify
  recovery without exposing another Project's Team. Switch Project A/B during a
  change and verify an old completion cannot reappear.
- Disconnect feeds; one bounded reconnect must restore current values. Confirm
  disposal and reconnect do not accumulate Admin listeners.
- Disable the Auth actor; Core must reject the protected session by its bounded
  Auth lease (at most 60 seconds). Restore the actor before further sign-in work.

The public probe intentionally watches `probes/same` in all three named
databases. The control operations `probe-fireux` and `probe-identity` change one
at a time; each must update only its corresponding value. This also verifies that
source pooling includes native Firestore/database identity.

`POST /api/__fixture/control` accepts only the named operations exposed by the
fixture source, with a JSON body such as `{"operation":"team-name"}`. It performs
local Admin mutations so changes can originate from a second browser without
weakening production command authority. `GET /api/app/status` is an ordinary
unwrapped JSON read. Sproochli integration is explicitly disabled in the seed.
The fixture does not exercise translation provider branches; no billable
translation request is needed or allowed for this proof.

## Read and listener costs

`GET /api/__fixture/metrics` reports request counts, feed projection dispatches,
native Query/getAll calls and returned-document counts, listener installs/stops,
snapshot document counts, current feed count, Core pool size and active listeners
by named database. `reset-metrics` clears counters while preserving active-source
inventory. These are logical SDK observations, not billed Firestore reads.
Browser-native Project/App listeners are outside the Admin counters; inspect
their native lifecycle separately. The instrumentation exists only in this
fixture and does not proxy production SDKs or change domain query cardinality.

Measure initial load, one safe field edit, one unchanged private field edit, a
burst, reconnect, scope change and disposal. Record browser JSON requests as well
as comparison dispatches: shared listeners do not share authorized projection
recomputation across browser feeds.

For the directory's existing 500-root ceiling, stop Kitchen consumers before
reseeding (or their existing directory feed will immediately grow its joins):

```sh
node tools/ide/fixtures/live-api/run.mjs seed 500
```

`GET http://127.0.0.1:3141/api/__fixture/plan` performs one actual directory
projection and reports its declared source count without installing listeners.
Then open the directory deliberately to measure actual listener installation and
recomputation costs. Report planned targets separately from installed listeners.
The fixture preserves the domain's current 500-root query and existing Menu
pagination; it adds no row caps, sentinels or stored revisions.

The source alone proves no browser outcome. Keep measured results and remaining
gaps in the task handoff, rather than freezing temporary observations here.
