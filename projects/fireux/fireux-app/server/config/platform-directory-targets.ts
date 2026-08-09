export type PlatformDirectoryTarget = {
  key: string
  projectId: string
  ecosystemId: string
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
  },
  {
    key: 'buenohost',
    projectId: 'buenohost-ecosystem',
    ecosystemId: 'buenohost',
  },
  {
    key: 'fireux',
    projectId: 'fireux-2005',
    ecosystemId: 'fireux',
  },
  {
    key: 'granite',
    projectId: 'granite-ecosystem',
    ecosystemId: 'granite',
  },
  {
    key: 'misebox',
    projectId: 'misebox-78f9c',
    ecosystemId: 'misebox',
  },
  {
    key: 'slap',
    projectId: 'slap-45389',
    ecosystemId: 'slap',
  },
  {
    key: 'werkbox',
    projectId: 'cleanbox-f15bc',
    ecosystemId: 'cleanbox',
    detailPath: '/ecosystems/werkbox',
  },
] as const satisfies readonly PlatformDirectoryTarget[]
