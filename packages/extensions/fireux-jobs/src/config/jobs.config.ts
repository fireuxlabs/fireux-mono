export type FireuxJobsConfig = {
  /**
   * Allowed workplace types for this ecosystem/app.
   * Examples:
   * - misebox: ['kitchen', 'ship', 'truck']
   * - cleanbox: ['house', 'car', 'school']
   */
  workplaces: string[]
}

export const defaultFireuxJobsConfig: FireuxJobsConfig = {
  workplaces: [],
}
