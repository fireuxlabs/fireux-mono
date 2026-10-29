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
