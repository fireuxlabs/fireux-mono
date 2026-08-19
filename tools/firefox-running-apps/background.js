const FOLDER_TITLE = 'Running FireUX Apps'
const TOOLBAR_ID = 'toolbar_____'
const REFRESH_SECONDS = 3
const PROBE_TIMEOUT_MS = 1200

let refreshRunning = false

async function loadApps() {
  const response = await fetch(browser.runtime.getURL('apps.json'))
  return response.json()
}

async function findManagedFolder() {
  const { folderId } = await browser.storage.local.get('folderId')
  if (folderId) {
    try {
      const [folder] = await browser.bookmarks.get(folderId)
      if (folder?.parentId === TOOLBAR_ID) return folder
    } catch {
      // The user removed the extension-owned folder. Recreate it below.
    }
  }

  const created = await browser.bookmarks.create({
    parentId: TOOLBAR_ID,
    title: FOLDER_TITLE,
  })
  await browser.storage.local.set({ folderId: created.id })
  return created
}

async function isRunning(app) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS)
  try {
    await fetch(app.baseUrl, {
      cache: 'no-store',
      mode: 'no-cors',
      signal: controller.signal,
    })
    return true
  } catch {
    return false
  } finally {
    clearTimeout(timeout)
  }
}

async function replaceFolderContents(folder, runningApps) {
  const children = await browser.bookmarks.getChildren(folder.id)
  await Promise.all(children.map((child) => browser.bookmarks.removeTree(child.id)))
  for (const app of runningApps) {
    await browser.bookmarks.create({
      parentId: folder.id,
      title: app.name,
      url: app.baseUrl,
    })
  }
}

async function refreshBookmarks() {
  if (refreshRunning) return
  refreshRunning = true
  try {
    const apps = await loadApps()
    const checks = await Promise.all(
      apps.map(async (app) => ({ app, running: await isRunning(app) }))
    )
    const runningApps = checks
      .filter(({ running }) => running)
      .map(({ app }) => app)
    const folder = await findManagedFolder()
    const children = await browser.bookmarks.getChildren(folder.id)
    const current = children.map(({ title, url }) => ({ title, url }))
    const wanted = runningApps.map(({ baseUrl, name }) => ({
      title: name,
      url: baseUrl,
    }))
    if (JSON.stringify(current) !== JSON.stringify(wanted)) {
      await replaceFolderContents(folder, runningApps)
    }
  } catch (error) {
    console.error('Could not refresh FireUX running-app bookmarks.', error)
  } finally {
    refreshRunning = false
  }
}

browser.runtime.onInstalled.addListener(refreshBookmarks)
browser.runtime.onStartup.addListener(refreshBookmarks)
setInterval(refreshBookmarks, REFRESH_SECONDS * 1000)
refreshBookmarks()
