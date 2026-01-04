import type { RateLimitConfig } from '@/types'

export class RateLimiter {
  private config: RateLimitConfig
  private storageKey = 'pokemon-game-rate-limit'

  constructor(config?: Partial<RateLimitConfig>) {
    this.config = {
      maxUploadsPerSession: 10,
      sessionDuration: 3600000, // 1 hour in milliseconds
      ...config
    }
  }

  /**
   * Check if the user can make another upload
   */
  checkLimit(): boolean {
    const data = this.getSessionData()
    
    // If no session data exists, user can upload
    if (!data) return true
    
    // Check if session has expired
    if (this.isSessionExpired(data.sessionStart)) {
      this.reset()
      return true
    }
    
    // Check if user has reached the limit
    return data.uploadCount < this.config.maxUploadsPerSession
  }

  /**
   * Increment the upload count for the current session
   */
  incrementCount(): void {
    const data = this.getSessionData()
    
    if (!data || this.isSessionExpired(data.sessionStart)) {
      // Start new session
      this.setSessionData({
        uploadCount: 1,
        sessionStart: Date.now()
      })
    } else {
      // Increment existing session
      this.setSessionData({
        uploadCount: data.uploadCount + 1,
        sessionStart: data.sessionStart
      })
    }
  }

  /**
   * Get the number of remaining uploads in the current session
   */
  getRemainingCount(): number {
    const data = this.getSessionData()
    
    if (!data || this.isSessionExpired(data.sessionStart)) {
      return this.config.maxUploadsPerSession
    }
    
    return Math.max(0, this.config.maxUploadsPerSession - data.uploadCount)
  }

  /**
   * Get the current upload count for the session
   */
  getCurrentCount(): number {
    const data = this.getSessionData()
    
    if (!data || this.isSessionExpired(data.sessionStart)) {
      return 0
    }
    
    return data.uploadCount
  }

  /**
   * Get time remaining in current session (in milliseconds)
   */
  getTimeRemaining(): number {
    const data = this.getSessionData()
    
    if (!data) return 0
    
    const elapsed = Date.now() - data.sessionStart
    const remaining = this.config.sessionDuration - elapsed
    
    return Math.max(0, remaining)
  }

  /**
   * Get time remaining in current session formatted as string
   */
  getTimeRemainingFormatted(): string {
    const remaining = this.getTimeRemaining()
    
    if (remaining === 0) return '0 minutes'
    
    const minutes = Math.ceil(remaining / 60000)
    
    if (minutes < 60) {
      return `${minutes} minute${minutes === 1 ? '' : 's'}`
    }
    
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    
    if (remainingMinutes === 0) {
      return `${hours} hour${hours === 1 ? '' : 's'}`
    }
    
    return `${hours}h ${remainingMinutes}m`
  }

  /**
   * Reset the rate limit session
   */
  reset(): void {
    localStorage.removeItem(this.storageKey)
  }

  /**
   * Get session data from localStorage
   */
  private getSessionData(): { uploadCount: number; sessionStart: number } | null {
    try {
      const data = localStorage.getItem(this.storageKey)
      if (!data) return null
      
      const parsed = JSON.parse(data)
      
      // Validate data structure
      if (typeof parsed.uploadCount !== 'number' || typeof parsed.sessionStart !== 'number') {
        return null
      }
      
      return parsed
    } catch (error) {
      console.warn('Failed to parse rate limit data from localStorage:', error)
      return null
    }
  }

  /**
   * Set session data in localStorage
   */
  private setSessionData(data: { uploadCount: number; sessionStart: number }): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data))
    } catch (error) {
      console.warn('Failed to save rate limit data to localStorage:', error)
    }
  }

  /**
   * Check if the session has expired
   */
  private isSessionExpired(sessionStart: number): boolean {
    const elapsed = Date.now() - sessionStart
    return elapsed >= this.config.sessionDuration
  }
}

// Export a default instance
export const rateLimiter = new RateLimiter()