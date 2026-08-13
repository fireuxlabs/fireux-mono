export async function completeKitchenMenuPublication<Root>(operations: {
  ensureRootEntry: () => Promise<Root>
  updateScopedMenu: () => Promise<void>
}) {
  await operations.updateScopedMenu()
  return operations.ensureRootEntry()
}
