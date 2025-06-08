export function useAppUserUtils() {
  function generateHandle(name: string): string {
    if (!name || typeof name !== "string") {
      return randomUserId();
    }
    return name.trim().toLowerCase().replace(/\s+/g, "") || randomUserId();
  }

  function generateDisplayName(email?: string, displayName?: string): string {
    if (displayName?.trim()) return displayName;
    if (email?.trim()) return email.split("@")[0] || randomUserId();
    return randomUserId();
  }

  function randomUserId(): string {
    return Math.random().toString(36).substring(2, 10);
  }

  return {
    generateHandle,
    generateDisplayName,
    randomUserId,
  };
}
