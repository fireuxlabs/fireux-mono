export type PlatformDirectoryTarget = {
  key: string
  projectId: string
  ecosystemId: string
  databaseId: string
  detailPath?: string
}

/**
 * Read targets for the FireUX control-plane directory.
 *
 * This is an infrastructure projection of each ecosystem package's Firebase
 * binding. The SEO guard keeps it aligned with those owning sources.
 */
export const PLATFORM_DIRECTORY_TARGETS = [
  {
    key: 'bringli',
    projectId: 'bringli-b0517',
    ecosystemId: 'bringli',
    databaseId: 'bringli',
  },
  {
    key: 'buenohost',
    projectId: 'buenohost-ecosystem',
    ecosystemId: 'buenohost',
    databaseId: 'buenohost',
  },
  {
    key: 'fireux',
    projectId: 'fireux-2005',
    ecosystemId: 'fireux',
    databaseId: 'fireux',
  },
  {
    key: 'granite',
    projectId: 'granite-ecosystem',
    ecosystemId: 'granite',
    databaseId: 'granite',
  },
  {
    key: 'misebox',
    projectId: 'misebox-78f9c',
    ecosystemId: 'misebox',
    databaseId: 'misebox',
  },
  {
    key: 'slap',
    projectId: 'slap-45389',
    ecosystemId: 'slap',
    databaseId: 'slap',
  },
  {
    key: 'werkbox',
    projectId: 'cleanbox-f15bc',
    ecosystemId: 'cleanbox',
    databaseId: 'cleanbox',
    detailPath: '/ecosystems/werkbox',
  },
] as const satisfies readonly PlatformDirectoryTarget[]
