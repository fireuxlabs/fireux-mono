# Menu Express manual delivery rehearsal

Reviewed: 2026-10-29
Source baseline: `901382069` plus this local change
Role: bounded local evidence, not a paid pilot or release approval

## Journey exercised

A clearly labelled fictional PDF supplied two items and known CHF prices. The
browser file chooser did not complete reliably, so the operator used the existing
Start blank path and transcribed the Menu through normal Workspace controls.
No read-only domain fixture was seeded into Firestore.

The saved Menu slug is `test-menu-express-29-october-2026` in Bären's existing
Kitchen. Its one TEST snacks section contains exactly TEST Tomato soup (CHF 8.50)
and TEST Garden salad (CHF 11). Description corrections preserved the source's
ingredients and milk note and added explicit do-not-prepare/sell labels. The
interrupted first attempt created the soup; retry reused it without duplicating
its Dish or placement.

The operator reviewed the content, temporarily published it through the existing
command and opened its public Menu and QR pages. The 390px viewport showed both
items, corrected descriptions and no horizontal overflow. Unrelated ordering
links were absent after the scoped-choice repair. This was controlled operator
review, not approval by a real paying customer.

The existing QR renderer produced SVG behind the Download QR control, with a
`menu-qr.svg` filename. The exact linked SVG was retained and parsed as valid SVG
XML. Browser download capture timed out; the file was retained from the actual
control's data URL, not from a newly generated replacement. Physical scan and
end-to-end browser download transfer are not claimed.

The Menu was returned to unpublished status after both temporary publications.
The first withdrawal returned HTTP 404 on public readback. The final operator UI
confirmed Unpublished; a repeated HTTP check timed out during local hot rebuilds,
so that final response is not claimed as newly verified.
The labelled Menu, section and two test Dishes remain for review. No existing
catalogue prices, hours, services, memberships or permissions were changed. No
application or Rules deployment occurred.

## Repairs at existing owners

- Menu item duplicate detection now pages within Core's existing 100-record query
  bound while preserving the 400-match refusal and retry/idempotency behaviour.
- Dish, Menu-content and publication commands refresh only current Menu API
  keys. They no longer invalidate App/session reads during a multi-step edit.
- Publication accepts the caller's existing Menu lifetime sources; current record
  and archive/restore callers bind their Kitchen/Menu context.
- QR generation waits for settled SVG output, exposes its download and clears
  obsolete exports on destination change, failure and disposal.
- Basic Menu service choices use the current canonical Menu ID, excluding other
  Menus' services. The existing shared layout, readers and controls remain.
- Related test fixtures now exercise current owners and native refresh contracts.

## Evidence and remaining work

148 focused source checks passed. Misebox App typing and changed-source lint
passed. Logs are recorded in `/private/tmp/menu-express-proof/`. The folder also contains the labelled PDF,
exported SVG, and `public-menu-mobile.png`. These are local artifacts.

A working manual preparation/publishing route is demonstrated. Automated PDF
upload/processing still needs a browser rehearsal. Purchase, buyer-scoped intake,
customer corrections/approval and paid fulfilment are not implemented by this
slice. Price, turnaround and hosting/update terms remain pre-sale decisions.
A local URL/phone-width preview is not a hosted customer handoff or physical scan.

## Connected delivery pipeline — second pass, 29 October 2026

The labelled request `336f1e24-ac18-4ea6-970c-feec0f0b5770` exercised the normal
App pages and trusted commands against the existing Bären test Menu. Its linked
Conversation stores the test communications; the delivery request stores the
stage, payment reference, target, reviewed content and approval.

Observed journey:

1. Submitted the labelled demo intake from the signed-in operator origin.
2. Uploaded `TEST-menu-express.pdf` through the normal multipart source command.
   Download through the customer proof matched the original PDF byte-for-byte.
3. Recorded an explicitly labelled local demo payment; no Stripe charge occurred.
4. Selected Bären's existing test Menu through the operator's authorized Menu list.
5. Customer requested a correction. The ordinary Menu editor updated only that
   test Menu's description; prices remained CHF 8.50 and CHF 11.
6. Sent the corrected content for review and approved it through the customer page.
7. Changed the test description again. Delivery was rejected with
   “Menu changed after approval. Send a new review.” The Menu was still unpublished.
8. Sent the new revision for review, approved it, then published and delivered
   through one guarded transaction using the existing Menu publication owner.
9. Inspected the public Menu at 390px: content width was also 390px, both test
   items and approved text were present. QR rendering produced a settled native
   SVG download with filename `menu-qr.svg`; the exact SVG was retained locally.
10. Recovered the delivered request on `localhost`, where the visitor was signed
    out, using its recovery key. A guest message succeeded, and reload retained
    delivered state, conversation and Menu/QR links.

The test Menu is now published by **private link**, deliberately excluded from
Bären's public Menu list. The venue list was inspected after this change; the
labelled Menu was absent. Direct Menu/QR links remain the demo delivery outputs.
Existing venue menus, operational prices, service configuration, hours and
memberships were not modified. Only labelled request/Conversation/source data
and the existing test Menu's description/publication/audience were changed.

Customer page: <http://localhost:3001/menu-express/336f1e24-ac18-4ea6-970c-feec0f0b5770>

Operator queue: <http://workspace.localhost:3001/dashboard/menu-express>

Public test Menu: <http://localhost:3001/kitchens/baeren-ringgenberg/menus/test-menu-express-29-october-2026>

### Verification boundary

152 focused workflow, Product, Menu publication and command tests passed in this
pass. They cover submission retry without duplicate request/Conversation,
wrong/expired recovery proof, non-operator rejection, unpaid preparation refusal,
correction and revision-bound approval, delivery retry, current-content mismatch,
provider Session/Product/price matching, duplicate notifications and native
Stripe signature verification. Misebox App and server typechecks and changed
source lint passed. Logs and UI evidence are in `/private/tmp/menu-express-proof/`.
Temporary demo recovery material was held outside the repository with mode 0600
and removed after the checks. The customer browser retains its normal recovery
state.

Stripe notifications were proved using controlled provider fixtures and the
installed SDK's genuine signature generation/verification. No live or sandbox
Stripe charge, new Product/price record, live webhook registration or deployment
is claimed. The deployed payment service still needs deliberate provider setup
and agreed price/terms before a paid pilot. Demo payment is server-limited to
operator-created labelled requests in local development.

Preparation remains manual through existing Kitchen/Menu commands. This pass
proves PDF source upload and download, not automatic PDF extraction. The review
contract currently supports regular interactive Menus with individual Dishes
and price options; daily/document Menus, promotions, add-ons and deposits fail
explicitly. The QR destination is local; a physical camera scan and hosted
customer handoff remain unproved. No Rules, IAM or live permission change was
made. The existing development-open policy is not a production privacy claim.

## Composition correction

The functional pass exposed composition gaps rather than closing the composition
gate. The correction keeps the same request storage and delivery semantics:

- `Operator.vue` composes the queue and selected request. Preparation owns its
  Kitchen/Menu choice and lifecycle. Customer review owns its correction draft.
- Customer and operator views share source, delivery and conversation controls.
  Recovery owns its key/copy interaction; page routes retain native Nuxt UI framing.
- The request controller, queue, preparation and intake use `useCommandScope`;
  no local epoch/disposal guard implementation remains in Menu Express.
- Core Chat owns the atomic Conversation/session/first-message creation and
  later messages. Both ordinary Chat and Menu Express use those transaction
  operations. Menu Express no longer builds Core Conversation fields or hashes.
- App server entrypoints delegate to named intake, read, customer, operator and
  payment owners. The former mixed `requests.ts` file is removed.

The composition boundary is assessed by inspected owners, registrations,
consumers and the route-to-command chain. Functional checks separately exercise
Core creation/message storage and failed atomic composition, closed/expired
proof, account/request/recovery-key changes before dispatch, stale read
completion and scope disposal, alongside the preserved delivery suite.

Composition-pass verification: 159 focused tests passed, including the preserved
152-check delivery boundary plus Core Chat and client-intent checks. Misebox App
and server typechecks, generated component registration and changed-source lint
passed. Intake, customer and operator URLs returned HTTP 200 with their expected
server-rendered content. Recovery loading starts after native Vue mount to keep
browser storage out of initial hydration.

The first interactive recheck was blocked by `browser.user is unavailable`.
Resetting the browser tool connection resolved that blocker. The subsequent
check reloaded the composed customer page while signed out, recovered its
existing delivered state, and sent a labelled test message through the shared
Conversation control. The operator queue opened that same job and displayed the
message. An operator reply through the same component appeared after customer
refresh. Both messages used the Core-owned Chat command after the refactor.

Fresh screenshots are `composition-customer-verified.png` and
`composition-operator-verified.png` in `/private/tmp/menu-express-proof/`.
Only two labelled messages were appended to the existing demo Conversation.
No new delivery request, repeated publication, deployment, Rules or live
permission change was needed for this recheck.

## Stripe provider verification — 30 October

The composed delivery checkpoint is saved as `56c06b581` and pushed to main.
The subsequent real test-checkout attempt stopped at provider authentication:
the installed Stripe CLI's existing test credential is expired. The connected
Stripe tool exposes only the live FIReUX account; the Misebox App has no test
key configured. No live credential was substituted and no Product, price,
Checkout Session or webhook registration was created.

The 13 focused Menu Express and Products checkout tests passed again, including
signed callback validation, duplicate notification handling, mismatched/unpaid
session rejection and interrupted-checkout retry. These remain fixture evidence,
not a completed hosted Stripe test payment. Resume with renewed test-mode access,
then exercise checkout and local signed webhook delivery for the same request.

## Customer retry correction — 30 October

Stripe work is parked at the user's request. A separate customer/operator pass
found that a successful write followed by a failed refresh returned failure to
the sender. The shared request controller now preserves the successful save,
shows an explicit saved-but-refresh-failed notice and asks for refresh rather
than resubmission. This lets Conversation clear the successfully sent draft;
actions and source uploads use the same boundary. Rejected writes still fail
without attempting a refresh, and existing stale-context checks remain active.
The 13 focused client and delivery tests passed, including the new failed-refresh
and failed-write regressions. This pass uses controlled transport failures;
it does not claim exactly-once delivery after an ambiguous write response.

The next intake pass adds a visible restore action for an interrupted submission.
Editing the form after a lost response no longer leaves the customer with only
an instruction to restore details and no control to do it. Restore uses the
retained original input; retry preserves the same request ID and recovery proof
and therefore uses the existing idempotent intake command. It does not discard
an uncertain submission or create a replacement request. The 14 focused client
and delivery tests passed, including response loss, intervening edits, restore
and successful retry with an identical payload.

## Preparation and source retry — 31 October

The previous recovery checkpoint was saved and pushed as `48c9cc224`.
Operator preparation now clears the selected Menu when its Kitchen changes and
requires a Menu in the loaded choices before linking. Workspace editing follows
the request's stored target rather than an uncommitted Kitchen/Menu draft. When
the linked Menu slug has not been resolved, the action opens that Kitchen's Menu
list instead of putting a document ID into the slug route. No extra reader,
stored field or navigation authority was introduced.

Source selection clears the native file input after capturing the chosen file,
so a failed upload can be retried by selecting that same file. The existing
content-addressed source command retains its deduplication. Sixteen focused
client/delivery tests passed, including cross-Kitchen selection, linked-target
navigation and repeat source selection. These checks exercise the component
logic and existing commands; they do not claim a new browser upload or delivery.
The App typecheck, formatting and diff checks passed. A read-only browser
recheck loaded the authenticated queue and the existing delivered demo request,
including its source, approved content, delivery links and conversation. No
request, message, payment or publication was created or changed in that check.

## Shared preparation proof — 31 October

This supersedes the manual Menu-selection preparation described above. The App
now transfers supplied bytes/URL into the existing Menus source command and
automatically binds the request; native Workspace and service use one source
reader and processing/review component.

Real labelled demo request `7e5b7f72-f988-4ce1-876d-74e24bfb34b4` supplied a
two-item PDF. The operator recorded demo payment (no charge), started automatic
preparation and ran existing extraction/normalization. The source appeared in
ordinary Workspace Menus, where the draft was created as
`menu-express-7e5b7f72-f988-4ce1-876d-74e24bfb34b4`, slug
`test-shared-preparation-31-october-2026`. It retained CHF 8.50 and CHF 11.00.
The service then presented that same Menu for customer approval and delivery.
Reload confirmed delivered; the signed-out public Menu rendered both test items.
The Menu is explicitly TEST ONLY and private-link; venue operations were unchanged.
Existing AI processing displayed a $0.05 usage estimate; no Stripe/customer charge
was made. No deployment or live policy change occurred.

The run exposed a Core schema/document-ID confusion rejecting `test-snacks`.
The identifier boundary now distinguishes schema names from document IDs, with
regression coverage. Retrying created one atomic draft successfully.

Evidence crosses both entrances in one live pipeline: service intake → native
Workspace draft → service approval/delivery. A second independent browser-native
upload was not rehearsed; native upload/URL and service adapters are exercised
by controlled command tests. The QR page generated its SVG and download URL after reload; no physical scan or
printer output was claimed. All 36 focused tests and Misebox App/server typing
checks passed. Changes remain uncommitted.
