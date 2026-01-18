import { describe, it, expect, beforeEach, vi } from 'vitest'
import { RateLimiter } from './RateLimiter'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

describe('RateLimiter', () => {
  let rateLimiter: RateLimiter
  
  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks()
    
    // Create new instance with test config
    rateLimiter = new RateLimiter({
      maxUploadsPerSession: 5,
      sessionDuration: 3600000 // 1 hour
    })
  })

  describe('checkLimit', () => {
    it('should return true when no session data exists', () => {
      // Given: No session data in localStorage
      localStorageMock.getItem.mockReturnValue(null)
      
      // When: Checking limit
      const result = rateLimiter.checkLimit()
      
      // Then: Should allow upload
      expect(result).toBe(true)
    })

    it('should return true when session has expired', () => {
      // Given: Expired session data
      const expiredSession = {
        uploadCount: 3,
        sessionStart: Date.now() - 7200000 // 2 hours ago
      }
      localStorageMock.getItem.mockReturnValue(JSON.stringify(expiredSession))
      
      // When: Checking limit
      const result = rateLimiter.checkLimit()
      
      // Then: Should allow upload and reset session
      expect(result).toBe(true)
      expect(localStorageMock.removeItem).toHaveBeenCalled()
    })

    it('should return true when under upload limit', () => {
      // Given: Active session under limit
      const activeSession = {
        uploadCount: 3,
        sessionStart: Date.now() - 1800000 // 30 minutes ago
      }
      localStorageMock.getItem.mockReturnValue(JSON.stringify(activeSession))
      
      // When: Checking limit
      const result = rateLimiter.checkLimit()
      
      // Then: Should allow upload
      expect(result).toBe(true)
    })

    it('should return false when at upload limit', () => {
      // Given: Active session at limit
      const activeSession = {
        uploadCount: 5,
        sessionStart: Date.now() - 1800000 // 30 minutes ago
      }
      localStorageMock.getItem.mockReturnValue(JSON.stringify(activeSession))
      
      // When: Checking limit
      const result = rateLimiter.checkLimit()
      
      // Then: Should deny upload
      expect(result).toBe(false)
    })
  })

  describe('incrementCount', () => {
    it('should start new session when no data exists', () => {
      // Given: No session data
      localStorageMock.getItem.mockReturnValue(null)
      
      // When: Incrementing count
      rateLimiter.incrementCount()
      
      // Then: Should create new session with count 1
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'pokemon-game-rate-limit',
        expect.stringContaining('"uploadCount":1')
      )
    })

    it('should increment existing session count', () => {
      // Given: Active session
      const activeSession = {
        uploadCount: 2,
        sessionStart: Date.now() - 1800000
      }
      localStorageMock.getItem.mockReturnValue(JSON.stringify(activeSession))
      
      // When: Incrementing count
      rateLimiter.incrementCount()
      
      // Then: Should increment to 3
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'pokemon-game-rate-limit',
        expect.stringContaining('"uploadCount":3')
      )
    })

    it('should start new session when current session expired', () => {
      // Given: Expired session
      const expiredSession = {
        uploadCount: 4,
        sessionStart: Date.now() - 7200000 // 2 hours ago
      }
      localStorageMock.getItem.mockReturnValue(JSON.stringify(expiredSession))
      
      // When: Incrementing count
      rateLimiter.incrementCount()
      
      // Then: Should start new session with count 1
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'pokemon-game-rate-limit',
        expect.stringContaining('"uploadCount":1')
      )
    })
  })

  describe('getRemainingCount', () => {
    it('should return max uploads when no session exists', () => {
      // Given: No session data
      localStorageMock.getItem.mockReturnValue(null)
      
      // When: Getting remaining count
      const result = rateLimiter.getRemainingCount()
      
      // Then: Should return max (5)
      expect(result).toBe(5)
    })

    it('should return correct remaining count for active session', () => {
      // Given: Active session with 2 uploads
      const activeSession = {
        uploadCount: 2,
        sessionStart: Date.now() - 1800000
      }
      localStorageMock.getItem.mockReturnValue(JSON.stringify(activeSession))
      
      // When: Getting remaining count
      const result = rateLimiter.getRemainingCount()
      
      // Then: Should return 3 (5 - 2)
      expect(result).toBe(3)
    })

    it('should return 0 when at limit', () => {
      // Given: Session at limit
      const fullSession = {
        uploadCount: 5,
        sessionStart: Date.now() - 1800000
      }
      localStorageMock.getItem.mockReturnValue(JSON.stringify(fullSession))
      
      // When: Getting remaining count
      const result = rateLimiter.getRemainingCount()
      
      // Then: Should return 0
      expect(result).toBe(0)
    })

    it('should return max uploads when session expired', () => {
      // Given: Expired session
      const expiredSession = {
        uploadCount: 5,
        sessionStart: Date.now() - 7200000
      }
      localStorageMock.getItem.mockReturnValue(JSON.stringify(expiredSession))
      
      // When: Getting remaining count
      const result = rateLimiter.getRemainingCount()
      
      // Then: Should return max (5)
      expect(result).toBe(5)
    })
  })

  describe('getCurrentCount', () => {
    it('should return 0 when no session exists', () => {
      // Given: No session data
      localStorageMock.getItem.mockReturnValue(null)
      
      // When: Getting current count
      const result = rateLimiter.getCurrentCount()
      
      // Then: Should return 0
      expect(result).toBe(0)
    })

    it('should return current upload count for active session', () => {
      // Given: Active session with 3 uploads
      const activeSession = {
        uploadCount: 3,
        sessionStart: Date.now() - 1800000
      }
      localStorageMock.getItem.mockReturnValue(JSON.stringify(activeSession))
      
      // When: Getting current count
      const result = rateLimiter.getCurrentCount()
      
      // Then: Should return 3
      expect(result).toBe(3)
    })
  })

  describe('getTimeRemaining', () => {
    it('should return 0 when no session exists', () => {
      // Given: No session data
      localStorageMock.getItem.mockReturnValue(null)
      
      // When: Getting time remaining
      const result = rateLimiter.getTimeRemaining()
      
      // Then: Should return 0
      expect(result).toBe(0)
    })

    it('should return correct time remaining for active session', () => {
      // Given: Session started 30 minutes ago
      const activeSession = {
        uploadCount: 2,
        sessionStart: Date.now() - 1800000 // 30 minutes ago
      }
      localStorageMock.getItem.mockReturnValue(JSON.stringify(activeSession))
      
      // When: Getting time remaining
      const result = rateLimiter.getTimeRemaining()
      
      // Then: Should return approximately 30 minutes (allow 1 second tolerance)
      expect(result).toBeGreaterThan(1790000) // 29.8 minutes
      expect(result).toBeLessThan(1810000) // 30.2 minutes
    })
  })

  describe('getTimeRemainingFormatted', () => {
    it('should return "0 minutes" when no time remaining', () => {
      // Given: No session data
      localStorageMock.getItem.mockReturnValue(null)
      
      // When: Getting formatted time
      const result = rateLimiter.getTimeRemainingFormatted()
      
      // Then: Should return "0 minutes"
      expect(result).toBe('0 minutes')
    })

    it('should format minutes correctly', () => {
      // Given: Session with 15 minutes remaining
      const activeSession = {
        uploadCount: 2,
        sessionStart: Date.now() - 2700000 // 45 minutes ago
      }
      localStorageMock.getItem.mockReturnValue(JSON.stringify(activeSession))
      
      // When: Getting formatted time
      const result = rateLimiter.getTimeRemainingFormatted()
      
      // Then: Should return "15 minutes"
      expect(result).toBe('15 minutes')
    })

    it('should format single minute correctly', () => {
      // Given: Session with 1 minute remaining
      const activeSession = {
        uploadCount: 2,
        sessionStart: Date.now() - 3540000 // 59 minutes ago
      }
      localStorageMock.getItem.mockReturnValue(JSON.stringify(activeSession))
      
      // When: Getting formatted time
      const result = rateLimiter.getTimeRemainingFormatted()
      
      // Then: Should return "1 minute" (singular)
      expect(result).toBe('1 minute')
    })
  })

  describe('reset', () => {
    it('should remove session data from localStorage', () => {
      // Given: Rate limiter instance
      
      // When: Resetting
      rateLimiter.reset()
      
      // Then: Should remove data
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('pokemon-game-rate-limit')
    })
  })

  describe('error handling', () => {
    it('should handle malformed localStorage data gracefully', () => {
      // Given: Invalid JSON in localStorage
      localStorageMock.getItem.mockReturnValue('invalid-json')
      
      // When: Checking limit
      const result = rateLimiter.checkLimit()
      
      // Then: Should return true (treat as no session)
      expect(result).toBe(true)
    })

    it('should handle localStorage errors gracefully', () => {
      // Given: localStorage throws error
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage error')
      })
      
      // When: Checking limit
      const result = rateLimiter.checkLimit()
      
      // Then: Should return true (treat as no session)
      expect(result).toBe(true)
    })
  })
})