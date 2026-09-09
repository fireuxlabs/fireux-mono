/** Proposes existing page controls; never authorizes a Project or App write. */
export type ProjectLandingIntent = {
  action: 'none' | 'read' | 'create' | 'open'
  target: string
  message: string
}
