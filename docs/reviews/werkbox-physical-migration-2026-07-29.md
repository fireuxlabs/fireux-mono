# Cleanbox to Werkbox physical migration

Status: blocked at target billing gate
Date: 2026-07-29

This is an execution record, not durable product canon. It inherits
`AGENTS.md`, `docs/ai/gpt-context.md`, and `docs/ai/werkbox-context.md`.

## Canon

Werkbox is the general practical-work ecosystem. Cleaning is its first
product-neutral category. Shared Job, Company, Place, Agent, Professional, and
User truth remains in the owning FireUX extension packages.

## Verified source authority

- Firebase project: `cleanbox-f15bc` (`Cleanbox`)
- Project number: `1083929507377`
- Canonical database: `cleanbox`, Standard edition, Firestore Native, `eur3`
- Legacy default database: `(default)`, Standard edition, `eur3`
- Directory outbox database: `directory-outbox`, Standard edition, `eur3`,
  delete protection enabled
- User Storage bucket: `cleanbox-f15bc.firebasestorage.app`, `US-CENTRAL1`,
  seven-day soft delete
- Hosting sites: `cleanbox`, `cleanbox-f15bc`, `richies-reinigung`
- Web apps: `cleanbox-app`, `richies-reinigung`
- Stored authority ids: Project/Ecosystem `cleanbox`; main App `cleanbox-app`
- Current public directory source: owner outbox from project
  `cleanbox-f15bc`, then FireUX platform-directory reconciliation

Point-in-time recovery and delete protection are disabled on the two source
application databases. No source delete is permitted during this migration.

## Target authority

- Firebase project id: `werkbox-ecosystem`
- Project number: `221322192848`
- Firebase display name: `Werkbox`
- Region: `eur3` for Firestore databases to match the source
- Named databases: `werkbox`, `directory-outbox`
- Main App id: `werkbox-app`
- Project/Ecosystem id: `werkbox`
- Hosting sites: `werkbox` plus retained `richies-reinigung`

## Surface classification

### Migrate

- Ecosystem Firebase binding and `.firebaserc`
- Project, Ecosystem, App, App-support, membership, shared-domain roots, and
  every known descendant in the `cleanbox` named database
- Directory publication outbox state and canonical Werkbox publication
- User-owned Storage objects and metadata
- Main Firebase Web App and the Richies tenant Web App
- Hosting authority for the Werkbox main App and Richies
- Auth provider configuration and required authorized domains
- App registry, deploy commands, Rules targets, security-contract manifest,
  project/app IDs, Firebase environment, public directory source, and PWA/SEO

### Redirect

- FireUX `/cleanbox` permanently redirects to
  `/ecosystems/werkbox/cleaning`
- Legacy Cleanbox public Hosting URL must redirect to canonical Werkbox after a
  separately authorised deployment

### Retain temporarily

- Source project `cleanbox-f15bc`
- Source databases and records
- Source Storage bucket and objects
- Legacy Hosting sites and Web Apps
- An explicit old-id to new-id mapping for `cleanbox`, `cleanbox-app`, and any
  stored dependent references until read-only verification is complete

### Delete only after a later verified cutover

- No item is approved for deletion in this execution.
- Source data, buckets, sites, apps, and project require a separate retirement
  decision after production verification and rollback-window expiry.

## Execution gates

1. Choose and create the target Firebase project and region.
2. Record target project number, databases, Web Apps, sites, Auth domains, and
   buckets in the idempotent manifest.
3. Create an auditable source Firestore export and Storage inventory/copy
   checkpoint before data writes.
4. Provision target databases, closed Rules, buckets, Web Apps, Auth config,
   and Hosting sites without deploying application code.
5. Copy and transform data idempotently, preserving entity ids where they are
   product-neutral and mapping `cleanbox`/`cleanbox-app` authority ids to
   `werkbox`/`werkbox-app`.
6. Verify complete descendant counts, references, public projections, and
   tenant isolation before changing local canonical config.
7. Update local source, guards, registry, redirects, and documentation.
8. Run focused guards, type checks, builds/smokes, and bounded remote reads.
9. Deployment and source retirement remain separately authorised actions.

## Backup evidence

The dedicated EU bucket
`gs://cleanbox-f15bc-werkbox-migration-backup` was created for this migration.
The 2026-07-29 export completed successfully for:

- `(default)`: 2 documents
- `cleanbox`: 24 documents
- `directory-outbox`: successful empty-or-bounded export

The source user bucket contains 15 objects. No object content was printed or
copied before target provisioning.

## Current blocker

The target project has no billing account. Standard named database provisioning
therefore failed before creating any database. The legacy source uses the open
CHF billing account `Firebase Payment`
(`billingAccounts/01F1A8-DD8202-7734DE`). Linking the target to a billing
account can incur charges and requires explicit approval.

## Recovery rule

The first cutover is additive. It never deletes or mutates the legacy source.
Rollback means pointing undeployed local configuration back to
`cleanbox-f15bc`; after a later deployment, rollback requires the preserved
source project plus the recorded mapping and export.
