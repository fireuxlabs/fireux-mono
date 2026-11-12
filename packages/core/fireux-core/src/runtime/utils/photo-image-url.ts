/** Remote photos use read-only normalization; bundled assets retain their paths. */
export function photoImageUrl(source: string | null | undefined): string {
  const value = source?.trim() || ''
  if (!/^https?:\/\//i.test(value)) return value
  return `/api/proxy/image?url=${encodeURIComponent(value)}&variant=photo`
}
