// @fireux-script
// last_used: 2026-07-21
// usage_note: imported by the directory-publication guard; declares publisher scope only and performs no remote access.
// Concurrent edit — 2026-07-21 12:33 CEST — Cleanbox-to-Werkbox migration: point the legacy physical publisher at the Werkbox app workspace.
// Concurrent edit — 2026-07-19 22:12 CEST — Directory Publication Rules Pass: lock the 11 canonical source scopes and two explicit exclusions.
// Concurrent edit — 2026-07-20 11:43 CEST — Directory Live Provisioning Pass: lock database placement, machine identities, minimal data role, and trigger regions.

export const DIRECTORY_PUBLICATION_DATABASES = Object.freeze({
  ownerOutbox: 'directory-outbox',
  platform: 'platform-directory',
})

export const DIRECTORY_PUBLICATION_RECEIVER = Object.freeze({
  firebaseProjectId: 'fireux-2005',
  databaseId: DIRECTORY_PUBLICATION_DATABASES.platform,
  serviceAccount: 'directory-receiver@fireux-2005.iam.gserviceaccount.com',
})

export const DIRECTORY_PUBLICATION_DATA_ROLE = Object.freeze({
  id: 'directoryPublicationWriter',
  title: 'Directory publication writer',
  description:
    'Reads and creates or updates directory publication records without delete or list access.',
  stage: 'GA',
  permissions: Object.freeze([
    'datastore.databases.get',
    'datastore.entities.create',
    'datastore.entities.get',
    'datastore.entities.update',
  ]),
})

const publisherServiceAccount = (firebaseProjectId) =>
  `directory-publisher@${firebaseProjectId}.iam.gserviceaccount.com`

const infrastructure = ({
  id,
  firebaseProjectId,
  appWorkspace,
  location,
  databases,
}) =>
  Object.freeze({
    id,
    firebaseProjectId,
    appWorkspace,
    location,
    edition: 'standard',
    deleteProtection: 'ENABLED',
    rulesConfig: `scripts/firebase/directory-publication/${id}.firebase.json`,
    publisherServiceAccount: publisherServiceAccount(firebaseProjectId),
    databases: Object.freeze([...databases]),
  })

export const DIRECTORY_PUBLICATION_INFRASTRUCTURE = Object.freeze([
  infrastructure({
    id: 'fireux',
    firebaseProjectId: 'fireux-2005',
    appWorkspace: 'projects/fireux/fireux-app',
    location: 'eur3',
    databases: [
      DIRECTORY_PUBLICATION_DATABASES.ownerOutbox,
      DIRECTORY_PUBLICATION_DATABASES.platform,
    ],
  }),
  infrastructure({
    id: 'bringli',
    firebaseProjectId: 'bringli-b0517',
    appWorkspace: 'projects/bringli/bringli-app',
    location: 'europe-west6',
    databases: [DIRECTORY_PUBLICATION_DATABASES.ownerOutbox],
  }),
  infrastructure({
    id: 'buenohost',
    firebaseProjectId: 'buenohost-ecosystem',
    appWorkspace: 'projects/buenohost/buenohost-app',
    location: 'eur3',
    databases: [DIRECTORY_PUBLICATION_DATABASES.ownerOutbox],
  }),
  infrastructure({
    id: 'cleanbox',
    firebaseProjectId: 'cleanbox-f15bc',
    appWorkspace: 'projects/werkbox/werkbox-app',
    location: 'eur3',
    databases: [DIRECTORY_PUBLICATION_DATABASES.ownerOutbox],
  }),
  infrastructure({
    id: 'granite',
    firebaseProjectId: 'granite-ecosystem',
    appWorkspace: 'projects/granite/granite-app',
    location: 'nam5',
    databases: [DIRECTORY_PUBLICATION_DATABASES.ownerOutbox],
  }),
  infrastructure({
    id: 'misebox',
    firebaseProjectId: 'misebox-78f9c',
    appWorkspace: 'projects/misebox/misebox-app',
    location: 'eur3',
    databases: [DIRECTORY_PUBLICATION_DATABASES.ownerOutbox],
  }),
  infrastructure({
    id: 'slap',
    firebaseProjectId: 'slap-45389',
    appWorkspace: 'projects/slap/slap-app',
    location: 'europe-west1',
    databases: [DIRECTORY_PUBLICATION_DATABASES.ownerOutbox],
  }),
])

const target = ({
  id,
  firebaseProjectId,
  databaseId,
  projectId,
  ecosystemId,
  region,
  appIds,
  ecosystemIds = [],
}) =>
  Object.freeze({
    id,
    firebaseProjectId,
    databaseId,
    outboxDatabaseId: DIRECTORY_PUBLICATION_DATABASES.ownerOutbox,
    projectId,
    ...(ecosystemId ? { ecosystemId } : {}),
    region,
    serviceAccount: publisherServiceAccount(firebaseProjectId),
    allowedAppIds: Object.freeze([...appIds]),
    allowedEcosystemIds: Object.freeze([...ecosystemIds]),
  })

export const DIRECTORY_PUBLICATION_TARGETS = Object.freeze([
  target({
    id: 'fireux-ecosystem',
    firebaseProjectId: 'fireux-2005',
    databaseId: 'fireux',
    projectId: 'fireux',
    ecosystemId: 'fireux',
    region: 'europe-west1',
    appIds: ['fireux-app', 'fireux-tenant'],
    ecosystemIds: ['fireux'],
  }),
  target({
    id: 'fireux-blank',
    firebaseProjectId: 'fireux-2005',
    databaseId: 'fireux',
    projectId: 'fireux',
    region: 'europe-west1',
    appIds: ['fireux-blank'],
  }),
  target({
    id: 'fireux-buenohost',
    firebaseProjectId: 'buenohost-ecosystem',
    databaseId: 'buenohost',
    projectId: 'fireux',
    ecosystemId: 'buenohost',
    region: 'europe-west6',
    appIds: ['buenohost', 'book-with-nats'],
    ecosystemIds: ['buenohost'],
  }),
  target({
    id: 'fireux-find-my-seo',
    firebaseProjectId: 'fireux-2005',
    databaseId: 'find-my-seo',
    projectId: 'fireux',
    region: 'europe-west1',
    appIds: ['find-my-seo-app'],
  }),
  target({
    id: 'fireux-go-qr',
    firebaseProjectId: 'fireux-2005',
    databaseId: 'go-qr',
    projectId: 'fireux',
    region: 'europe-west1',
    appIds: ['go-qr'],
  }),
  target({
    id: 'fireux-sproochli',
    firebaseProjectId: 'fireux-2005',
    databaseId: 'sproochli',
    projectId: 'fireux',
    region: 'europe-west1',
    appIds: ['sproochli'],
  }),
  target({
    id: 'bringli',
    firebaseProjectId: 'bringli-b0517',
    databaseId: 'bringli',
    projectId: 'bringli',
    ecosystemId: 'bringli',
    region: 'europe-west6',
    appIds: ['bringli-app'],
    ecosystemIds: ['bringli'],
  }),
  target({
    id: 'cleanbox',
    firebaseProjectId: 'cleanbox-f15bc',
    databaseId: 'cleanbox',
    projectId: 'cleanbox',
    ecosystemId: 'cleanbox',
    region: 'europe-west1',
    appIds: ['cleanbox-app', 'richies-reinigung'],
    ecosystemIds: ['cleanbox'],
  }),
  target({
    id: 'granite',
    firebaseProjectId: 'granite-ecosystem',
    databaseId: 'granite',
    projectId: 'granite',
    ecosystemId: 'granite',
    region: 'us-central1',
    appIds: ['granite-app'],
    ecosystemIds: ['granite'],
  }),
  target({
    id: 'misebox',
    firebaseProjectId: 'misebox-78f9c',
    databaseId: 'misebox',
    projectId: 'misebox',
    ecosystemId: 'misebox',
    region: 'europe-west1',
    appIds: [
      'baeren-ringgenberg',
      'bangin-coffee',
      'la-tap-berne',
      'misebox-app',
    ],
    ecosystemIds: ['misebox'],
  }),
  target({
    id: 'slap',
    firebaseProjectId: 'slap-45389',
    databaseId: 'slap',
    projectId: 'slap',
    ecosystemId: 'slap',
    region: 'europe-west1',
    appIds: ['slap-app', 'yellow-velo'],
    ecosystemIds: ['slap'],
  }),
])

export const DIRECTORY_PUBLICATION_EXCLUSIONS = Object.freeze([
  Object.freeze({
    entityKind: 'app',
    entityId: 'qrdoc',
    reason: 'not_a_fireux_project_app',
  }),
])
