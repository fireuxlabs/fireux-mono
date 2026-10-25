# FireUX App search relationship matrix

> Archived / parked on 2026-10-25. Preserved planning and evidence; this file is not the active task list. See [current FireUX priorities](../../../roadmaps/fireux-priorities.md) before resuming work.

Date: 2026-08-04
Role: source-grounded review, not canon

## Relationship rule

Every published App is discoverable through the FireUX platform directory.
That does not make every App part of the `fireux` Ecosystem.

- A `global` App is the main App for one Ecosystem.
- A `tenant` App belongs to that Ecosystem and owns its local business facts.
- A `standalone` App is published directly under FireUX and has no canonical
  Ecosystem parent, even when `ecosystem: 'fireux'` loads shared runtime
  configuration.
- Logical product identity and physical storage identity may differ only where
  an approved migration records the difference. Werkbox currently retains the
  physical `cleanbox` Project, Ecosystem, database, and main App identifiers.

The intended link graph is:

`FireUX /apps → Ecosystem overview → App directory detail → App website`

Standalone Apps use:

`FireUX /apps → App directory detail → App website`

## Matrix

The registry and each App's `nuxt.config.ts` own the repository relationship.
“Live directory” reflects the bounded FireUX public directory read during this
review; it is evidence for the data work still required, not a second source.

| App                     | App id                | Role       | Logical parent  | Physical id delta                      | Live directory                       | Search/data action                                                                               |
| ----------------------- | --------------------- | ---------- | --------------- | -------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------ |
| FireUX                  | `fireux-app`          | global     | FireUX          | none                                   | yes                                  | Keep as the platform and FireUX Ecosystem main App.                                              |
| Michel AG Metallbau     | `fireux-tenant`       | tenant     | FireUX          | none                                   | yes, named “FireUX Tenant”           | Align the public App name and publish business-specific copy before local search work.           |
| Find My SEO             | `find-my-seo-app`     | standalone | FireUX platform | separate `find-my-seo` database        | yes                                  | Keep `ecosystem_id` empty; registry role is now aligned to standalone.                           |
| Sproochli               | `sproochli`           | standalone | FireUX platform | separate `sproochli` database          | yes                                  | Keep direct under FireUX; retain its own canonical product pages.                                |
| Go QR                   | `go-qr`               | standalone | FireUX platform | separate `go-qr` database              | yes                                  | Keep direct under FireUX; retain its own Tool and document canonicals.                           |
| FireUX Blank            | `fireux-blank`        | standalone | FireUX platform | none                                   | yes                                  | Treat as a harness; approve an explicit index/archive decision before promoting it as a product. |
| Misebox                 | `misebox-app`         | global     | Misebox         | none                                   | yes, copy missing                    | Publish App tagline, short biography, and description.                                           |
| La Tap Berne            | `la-tap-berne`        | tenant     | Misebox         | none                                   | yes, copy missing                    | Publish restaurant identity and bounded local-business facts.                                    |
| Hotel Bären Ringgenberg | `baeren-ringgenberg`  | tenant     | Misebox         | none                                   | missing                              | Publish the canonical owner record and directory projection.                                     |
| Bangin Coffee           | `bangin-coffee`       | tenant     | Misebox         | none                                   | missing                              | Bootstrap the canonical owner record, then publish its projection.                               |
| Interlaken Essen        | `interlaken-essen`    | tenant     | Misebox         | none                                   | missing                              | Publish its App projection before exposing the parent relationship in FireUX search.             |
| Werkbox                 | `cleanbox-app`        | global     | Werkbox         | physical Ecosystem/database `cleanbox` | yes as Cleanbox family, copy missing | Preserve the approved physical ids; publish current Werkbox names and copy.                      |
| Richies                 | `richies-reinigung`   | tenant     | Werkbox         | physical Ecosystem/database `cleanbox` | yes, copy missing                    | Publish cleaning-business identity and local facts under the Werkbox parent.                     |
| Bringli                 | `bringli-app`         | global     | Bringli         | none                                   | yes, copy missing                    | Publish Supplier-product copy on both App and Ecosystem records.                                 |
| BuenoHost               | `buenohost`           | global     | BuenoHost       | none                                   | App yes; relationship missing        | Repair `ecosystem_id` and publish the missing BuenoHost Ecosystem record.                        |
| Book with Nats          | `book-with-nats`      | tenant     | BuenoHost       | none                                   | missing                              | Publish the canonical owner record and directory projection.                                     |
| AUSFinn Apartments      | `ausfinn-apartments`  | tenant     | BuenoHost       | none                                   | missing                              | Added to publication scope; publish owner copy and bounded property facts.                       |
| Granite                 | `granite-app`         | global     | Granite         | none                                   | yes, copy missing                    | Publish property/portfolio product copy.                                                         |
| Slap                    | `slap-app`            | global     | Slap            | none                                   | missing                              | Publish the main App and Ecosystem records before child discovery.                               |
| Yellow Velo             | `yellow-velo`         | tenant     | Slap            | none                                   | missing                              | Bootstrap the canonical owner record, then publish product/business copy.                        |
| Holzworm                | `holzworm`            | tenant     | Slap            | none                                   | missing                              | Added to publication scope; publish its owner record and business facts.                         |
| Lifeguard Community     | `lifeguard-community` | tenant     | Slap            | none                                   | missing                              | Added to publication scope; publish its owner record and community-product facts.                |

## Ranked gaps

1. **Publication coverage:** four registered Apps were absent from the guarded
   publication allowlists. The source scope now includes AUSFinn Apartments,
   Interlaken Essen, Holzworm, and Lifeguard Community.
2. **Missing public records:** nine registered Apps and the BuenoHost and Slap
   Ecosystems are absent from the live FireUX directory. Source changes alone
   do not create those remote records.
3. **Relationship drift:** BuenoHost is currently projected without its
   Ecosystem relationship. Werkbox intentionally retains `cleanbox` physical
   ids, but public naming must complete the migration without changing storage
   authority.
4. **Weak literature:** several active records have no tagline, short
   biography, or description. Search pages should expose only verified role
   and parent facts until their owners publish better copy.
5. **Canonical website projection:** the bounded App directory does not yet
   expose the already-public App website field. Add it only through the
   projection, reconciliation hashes, tests, and rendered link contract
   together.
6. **Index policy:** FireUX Blank is a development harness in current source.
   Decide whether it should be archived from the public directory or receive
   an explicit `noindex` policy before adding all App details to a sitemap.

## Ownership

- Core owns reusable canonical, robots, structured-data, and sitemap mechanics.
- FireUX owns the platform directory and parent relationship pages.
- Each Ecosystem owns the explanation of its product family.
- Each App owns its canonical website and shortest proven product summary.
- Each tenant owns local business identity, address/service area, hours,
  contact, imagery, and other bounded local facts.
- Remote publication remains a separate authorized data operation; this review
  and its source guards perform no database write or deployment.
