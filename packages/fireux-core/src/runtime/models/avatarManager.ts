/**
 * Avatar Management Utilities
 *
 * Handles avatar logic for CoreUser and AppUser models
 */

/**
 * Avatar storage paths and URL generation
 */
export class AvatarManager {
  /**
   * Generate core user avatar storage path
   */
  static getCoreUserAvatarPath(userId: string): string {
    return `core-users/${userId}/avatar`
  }

  /**
   * Generate app user avatar storage path
   */
  static getAppUserAvatarPath(appId: string, userId: string): string {
    return `${appId}/users/${userId}/avatar`
  }

  /**
   * Generate Firebase Storage URL
   */
  static generateStorageUrl(bucketName: string, storagePath: string): string {
    return `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(storagePath)}?alt=media`
  }

  /**
   * Check if avatar URL is app-specific (not core user avatar)
   */
  static isAppSpecificAvatar(avatarUrl: string, appId: string): boolean {
    return (
      avatarUrl.includes(`${appId}/users/`) &&
      !avatarUrl.includes('core-users/')
    )
  }

  /**
   * Check if avatar URL is a core user avatar
   */
  static isCoreUserAvatar(avatarUrl: string): boolean {
    return avatarUrl.includes('core-users/')
  }

  /**
   * Check if avatar URL is external (Google, etc.)
   */
  static isExternalAvatar(avatarUrl: string): boolean {
    return !avatarUrl.includes('firebasestorage.googleapis.com')
  }

  /**
   * Get the default avatar for a new AppUser
   * This copies the CoreUser avatar URL
   */
  static getDefaultAppUserAvatar(coreUserAvatar: string): string {
    return coreUserAvatar
  }

  /**
   * Determine avatar strategy for AppUser
   */
  static getAvatarStrategy(
    coreUserAvatar: string,
    currentAppUserAvatar?: string,
    appId?: string
  ): {
    strategy: 'use_core' | 'use_app_specific' | 'use_external'
    shouldCopy: boolean
    description: string
  } {
    // If no current app avatar, use core avatar
    if (!currentAppUserAvatar) {
      return {
        strategy: 'use_core',
        shouldCopy: false,
        description: 'New AppUser - copy CoreUser avatar URL',
      }
    }

    // If current avatar is external, keep it
    if (this.isExternalAvatar(currentAppUserAvatar)) {
      return {
        strategy: 'use_external',
        shouldCopy: false,
        description: 'External avatar (Google, etc.) - no changes needed',
      }
    }

    // If current avatar is app-specific, keep it
    if (appId && this.isAppSpecificAvatar(currentAppUserAvatar, appId)) {
      return {
        strategy: 'use_app_specific',
        shouldCopy: false,
        description: 'App-specific avatar - user has customized for this app',
      }
    }

    // If current avatar is core but different from current core, update
    if (
      this.isCoreUserAvatar(currentAppUserAvatar) &&
      currentAppUserAvatar !== coreUserAvatar
    ) {
      return {
        strategy: 'use_core',
        shouldCopy: false,
        description: 'Update to latest CoreUser avatar',
      }
    }

    // Default: use core avatar
    return {
      strategy: 'use_core',
      shouldCopy: false,
      description: 'Default to CoreUser avatar',
    }
  }
}

/**
 * Avatar operation types for consistency
 */
export type AvatarOperation = {
  type: 'copy_from_core' | 'upload_app_specific' | 'update_url_only'
  sourcePath?: string
  destinationPath?: string
  newUrl: string
  description: string
}
