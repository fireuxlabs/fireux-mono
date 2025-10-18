# FireUX Places Extension Roadmap

Status legend: ✅ completed · ⚙️ in progress · ❌ missing · 🧩 planned (blocked on shared work)

## ✅ Completed

- Combined Firestore + Google autocomplete search with automatic logo enrichment and avatar uploads
- Firestore persistence helpers (`usePlaces`, `usePlaceSave`) ensure canonical IDs and stored metadata
- Place detail page renders professional rosters, timestamps, and deep links out to Google Maps
- Developer tooling (`/dev/fireux-places`) exposes collection snapshots for inspection

## ⚙️ In Progress

- Nothing identified

## ❌ Missing

- Manual place creation and editing flows (`/places/new`) with validation, reverse geocoding, and Firestore write forms
- Map exploration route (`/places/map`) with clustering, category filters, and saved-place overlays
- Business verification workflow (email/domain confirmation, admin review, verification badges)
- Relationship management to link places with jobs, kitchens, and client accounts (attach/detach UI and Firestore schema)
- Invitation and collaboration flows from place profiles (share with organizations, send invites)
- Audit/history tracking for place updates and roster changes

## 🧩 Planned / Cross-Package Dependencies

- Linking to jobs and Misebox kitchens depends on shared Firestore schemas from `fireux-core` and `fireux-jobs`
- Verification and invitation flows require common identity/email services; coordinate with platform messaging stack
- Map visualization should reuse any platform-wide map component once adopted (check `copilot-07-ux-conventions.md` guidance)

## Next Actions

- [ ] Design manual place creation/editing UI and integrate `usePlaceSave` with validation + reverse geocode helper
- [ ] Implement `/places/map` route featuring map component, filters, and saved-place highlighting
- [ ] Define verification data model (status, reviewer, timestamps) and build request/approval UI
- [ ] Extend Firestore schema + composables to record links to jobs, kitchens, and client entities; surface attach/detach UI on detail page
- [ ] Add invitation workflow (email templates, pending invitations list) scoped to place profiles
- [ ] Capture change history for teams/addresses to support auditing and rollbacks
