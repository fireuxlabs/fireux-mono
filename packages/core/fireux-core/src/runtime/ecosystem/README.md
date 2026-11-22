# Ecosystem

The [Ecosystem model](models/ecosystem.model.ts) owns shared identity and its
optional FireUX Project relationship. A Firebase project ID is infrastructure
configuration. A canonical Ecosystem can exist with zero Apps. The FireUX
Project portal retains its exact relationship checks.

The [trusted provisioner](server/identity/provision.ts) validates prerequisites,
canonical identity and link compatibility on creation and retry. The developer
Main App bootstrap is a supported caller. Standalone signed-in provisioning
still lacks a verified operator entrypoint. `App.ecosystem_id` owns the App
relationship. Reverse locators support discovery and reconciliation.
