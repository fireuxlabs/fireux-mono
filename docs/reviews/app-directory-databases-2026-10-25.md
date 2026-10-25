# App directory database audit

Date: 2026-10-25
Role: read-only audit snapshot, not a migration plan or rulebook

## Evidence boundary

Live Google Firestore metadata and Admin SDK reads inspected seven configured
Firebase projects and 20 databases. All returned STANDARD edition.
Read-only root collection inventories and bounded `apps` reads selected document
identity, name, ecosystem_id, status and project_id only. No credentials, private
context fields or other Entity records were included. Each query was capped at
501 records; no Apps result reached the cap. No database writes were performed.

## Stored App inventory

| Firebase project | Database | App records | Current platform target | Document IDs |
| --- | --- | ---: | --- | --- |
| bringli-b0517 | (default) | 0 | no |  |
| bringli-b0517 | bringli | 1 | yes | bringli-app |
| buenohost-ecosystem | buenohost | 2 | yes | book-with-nats, buenohost |
| buenohost-ecosystem | (default) | 0 | no |  |
| fireux-2005 | go-qr | 1 | no | go-qr |
| fireux-2005 | find-my-seo | 1 | no | find-my-seo-app |
| fireux-2005 | lifeguard-community | 0 | no |  |
| fireux-2005 | holzworm | 0 | no |  |
| fireux-2005 | (default) | 0 | no |  |
| fireux-2005 | sproochli | 1 | no | sproochli |
| fireux-2005 | fireux | 3 | yes | fireux-app, fireux-blank, fireux-tenant |
| granite-ecosystem | (default) | 0 | no |  |
| granite-ecosystem | granite | 1 | yes | granite-app |
| misebox-78f9c | (default) | 0 | no |  |
| misebox-78f9c | misebox | 6 | yes | baeren-ringgenberg, bangin-coffee, friiites, interlaken-essen, la-tap-berne, misebox-app |
| misebox-78f9c | sproochli | 0 | no |  |
| slap-45389 | slap | 3 | yes | interlaken-bike-tours, slap-app, yellow-velo |
| slap-45389 | (default) | 0 | no |  |
| cleanbox-f15bc | cleanbox | 2 | yes | cleanbox-app, richies-reinigung |
| cleanbox-f15bc | (default) | 0 | no |  |

Total: 21 App records; all observed records have active status. No duplicate
App document IDs were found across these inspected apps collections.

## Route behavior

- Core `/api/apps` uses the runtime database, queries its root `apps` collection,
  filters exact `ecosystem_id`, filters active status and paginates by document ID.
- FireUX `/api/platform/apps` queries the seven configured named databases in
  `server/config/platform-directory-targets.ts`, merges their root App records
  and paginates the combined identities. Those targets currently contribute 18.
- Misebox's six App records are in misebox-78f9c / misebox / apps and carry
  ecosystem_id=misebox. Its public directory scope matches that storage.
- Firebase project IDs, Firestore database IDs, product Project IDs and Ecosystem
  IDs are separate identifiers; a matching label is not proof of shared storage.

## Gaps

1. FireUX's platform directory omits three observed active records:
   fireux-2005 / go-qr / apps/go-qr;
   fireux-2005 / find-my-seo / apps/find-my-seo-app;
   fireux-2005 / sproochli / apps/sproochli.
   These databases are absent from the directory target list.
2. Those three stored records have no ecosystem_id. Their Apps' Nuxt config
   declares ecosystemId=fireux and a standalone database override. The stored
   records and current declared relationship disagree. Merely adding the
   databases to the directory is insufficient: the canonical App reader requires
   ecosystem_id, so those records require a separately reviewed data repair.
3. Other named databases exist without root App records: holzworm and
   lifeguard-community in fireux-2005, and sproochli in misebox-78f9c. This audit
   does not infer that a database represents an active deployed App.
4. Every default database inspected has no root App records. Runtime bindings
   must continue to name their intended database; querying default would not
   retrieve these directories.
5. Both current directories are active-only, rather than historical inventories.
   This audit cannot establish deleted records or every App ever created.

## Recommendation for the two directory scenarios

Keep one canonical App record per App and one shared `apps` record contract.
The Ecosystem directory selects that Ecosystem's Apps; the platform directory
must cover every intended source, including declared standalone Apps. Repair
record identity/parent fields and directory coverage together after an exact
migration plan and retained preimages. Do not mirror App records into an extra
platform collection to hide source inconsistency.

No records, source target lists, indexes, Rules, credentials or deployments were
changed by this audit. Broader Entity data, permissions and deployed Rules were
outside its scope.

## Authorized repair and verification — 2026-10-25

Following the audit, the user authorized repair of the three missing Apps.
Exact preimages, a hashed plan, the repair script and per-target readback receipts
are retained outside Git at:

`/Users/danielwatson/.codex/.chatgpt-projects/g-p-69832ced5e0c8191bcbc90dbde10482f/artifacts/app-record-repair-2026-10-25/`

Each existing root App received `ecosystem_id: fireux` and an updated audit stamp.
No other root fields changed. Its previously missing
`fireux/ecosystems/fireux/apps/{appId}` reverse locator was created using the
existing `app_id`, `database_id`, `created` and `updated` shape. No App record was
copied, moved or deleted, and no roles, grants, credentials or Rules changed.
Every candidate passed the current canonical App parser before applying;
transactions checked retained update times and post-write checks verified
unrelated fields were unchanged. Root writes and locator writes are separate
transactions across databases; each has a retained receipt and verified readback.

PLATFORM_APP_TARGETS now covers the three standalone databases as well as the
seven Ecosystem App sources. Ecosystem identity discovery remains on the original
seven-target list, so no duplicate Ecosystems are manufactured. Platform App
list/detail and Project-scoped App reads use the complete App source list.

Live local endpoint checks after repair:

| Query | Result |
| --- | --- |
| FireUX platform Apps | 21 unique canonical active Apps; all three repaired IDs present |
| Misebox Apps | 6 Apps; every ecosystem_id is misebox |
| Platform Apps filtered to Misebox | The same 6 IDs |
| Platform Apps filtered to FireUX | 6 Apps, including the three repaired standalone records |

All responses fit one 100-record verification page, with no next cursor.
The FireUX browser page displayed 21 Apps and all repaired links. Sixteen
focused directory/Project read tests, lint and the FireUX App typecheck passed.
These are local source and live data results; no production App deployment was
performed. The directories retain their existing active-only policy.
