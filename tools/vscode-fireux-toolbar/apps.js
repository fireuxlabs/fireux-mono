const path = require('node:path')
const { pathToFileURL } = require('node:url')

// Presentation only. App manifests and the launcher discovery own paths and ports.
const presentation = {
  fireux: {
    name: 'FireUX',
    icon: '$(flame)',
    commandId: 'fireuxToolbar.startFireux',
  },
  misebox: {
    name: 'Misebox',
    icon: '$(book)',
    commandId: 'fireuxToolbar.startMisebox',
  },
  werkbox: {
    name: 'Werkbox',
    icon: '$(beaker)',
    commandId: 'fireuxToolbar.startWerkbox',
  },
  richies: {
    name: 'Richies Reinigung',
    icon: '$(tools)',
    commandId: 'fireuxToolbar.startRichies',
  },
  tenant: {
    name: 'FireUX Tenant',
    icon: '$(home)',
    commandId: 'fireuxToolbar.startTenant',
  },
  bringli: {
    name: 'Bringli',
    icon: '$(symbol-namespace)',
    commandId: 'fireuxToolbar.startBringli',
  },
  'find-my-seo': {
    name: 'Find My SEO',
    icon: '$(search)',
    commandId: 'fireuxToolbar.startFindMySeo',
  },
  sproochli: {
    name: 'Sproochli',
    icon: '$(globe)',
    commandId: 'fireuxToolbar.startSproochli',
  },
  buenohost: {
    name: 'BuenoHost',
    icon: '$(key)',
    commandId: 'fireuxToolbar.startBuenoHost',
  },
  'go-qr': {
    name: 'Go QR',
    icon: '$(file-media)',
    commandId: 'fireuxToolbar.startGoQr',
  },
  'fireux-blank': {
    name: 'FireUX Blank',
    icon: '$(empty-window)',
    commandId: 'fireuxToolbar.startFireuxBlank',
  },
  'yellow-velo': {
    name: 'Yellow Velo',
    icon: '$(symbol-color)',
    commandId: 'fireuxToolbar.startYellowVelo',
  },
  holzworm: {
    name: 'Holzworm',
    icon: '$(tools)',
    commandId: 'fireuxToolbar.startHolzworm',
  },
  'lifeguard-community': {
    name: 'Lifeguard Community',
    icon: '$(heart)',
    commandId: 'fireuxToolbar.startLifeguardCommunity',
  },
  granite: {
    name: 'Granite',
    icon: '$(database)',
    commandId: 'fireuxToolbar.startGranite',
  },
  slap: {
    name: 'Slap',
    icon: '$(sparkle)',
    commandId: 'fireuxToolbar.startSlap',
  },
  'la-tap-berne': {
    name: 'La Tap Berne',
    icon: '$(tag)',
    commandId: 'fireuxToolbar.startLaTapBerne',
  },
  'baeren-ringgenberg': {
    name: 'B\u00e4ren Ringgenberg',
    icon: '$(tag)',
    commandId: 'fireuxToolbar.startBaerenRinggenberg',
  },
  'book-with-nats': {
    name: 'Book with Nats',
    icon: '$(home)',
    commandId: 'fireuxToolbar.startBookWithNats',
  },
  'ausfinn-apartments': {
    name: 'AUSFinn Apartments',
    icon: '$(home)',
    commandId: 'fireuxToolbar.startAusfinnApartments',
  },
  'bangin-coffee': {
    name: 'Bangin Coffee',
    icon: '$(coffee)',
    commandId: 'fireuxToolbar.startBanginCoffee',
  },
  'interlaken-essen': {
    name: 'Interlaken Essen',
    icon: '$(tag)',
    commandId: 'fireuxToolbar.startInterlakenEssen',
  },
  friiites: {
    name: 'Friiites',
    icon: '$(server-process)',
    commandId: 'fireuxToolbar.startFriiites',
  },
  sharer: {
    name: 'Sharer',
    icon: '$(server-process)',
    commandId: 'fireuxToolbar.startSharer',
  },
  kjordi: {
    name: 'Kjordi',
    icon: '$(server-process)',
    commandId: 'fireuxToolbar.startKjordi',
  },
}

async function getApps(repoRoot) {
  if (!repoRoot) return []
  const { getAppRegistryEntries } = await import(
    pathToFileURL(path.join(repoRoot, 'tools/fireux-launcher/apps.mjs')).href
  )
  return getAppRegistryEntries(repoRoot).map((app) => {
    const display = presentation[app.key] ?? {
      name: app.key,
      icon: '$(server-process)',
      commandId: `fireuxToolbar.start${app.key
        .split('-')
        .map((part) => part[0].toUpperCase() + part.slice(1))
        .join('')}`,
    }
    const directory = `'${app.directory.replaceAll("'", "'\"'\"'")}'`
    return {
      ...app,
      ...display,
      taskLabel: `pnpm dev:${app.key}`,
      terminalName: `${display.name} (${app.port})`,
      pnpmCommand: `pnpm --dir ${directory} dev`,
      tooltip: `Start ${display.name} dev (port ${app.port})`,
      url: app.baseUrl,
    }
  })
}

module.exports = { getApps }
