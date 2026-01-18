import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { UploadService } from './UploadService'
import { rateLimiter } from './RateLimiter'
import type { RecognitionResult } from '@/types'

// Mock the rateLimiter
vi.mock('./RateLimiter', () => ({
  rateLimiter: {
    checkLimit: vi.fn(),
    getTimeRemainingFormatted: vi.fn(),
    getRemainingCount: vi.fn()
  }
}))

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock FileReader with proper constructor
class MockFileReader {
  result: string = ''
  onload: (() => void) | null = null
  onerror: (() => void) | null = null
  
  readAsDataURL(blob: Blob) {
    // Set result immediately for testing
    this.result = 'data:image/png;base64,dGVzdCBpbWFnZSBkYXRh'
    // Call onload asynchronously
    setTimeout(() => {
      if (this.onload) {
        this.onload()
      }
    }, 0)
  }
}

global.FileReader = MockFileReader as any

describe('UploadService', () => {
  let uploadService: UploadService
  let mockBlob: Blob
  
  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks()
    
    // Set up environment variable
    vi.stubEnv('VITE_LAMBDA_URL', 'https://test-lambda-url.amazonaws.com')
    
    uploadService = new UploadService()
    
    // Create mock blob
    mockBlob = new Blob(['test image data'], { type: 'image/png' })
    Object.defineProperty(mockBlob, 'size', { value: 1024 }) // 1KB
    
    // Set up default rateLimiter mocks
    vi.mocked(rateLimiter.checkLimit).mockReturnValue(true)
    vi.mocked(rateLimiter.getTimeRemainingFormatted).mockReturnValue('30 minutes')
    vi.mocked(rateLimiter.getRemainingCount).mockReturnValue(5)
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  describe('constructor', () => {
    it('should initialize with Lambda URL from environment', () => {
      // Given: Environment variable set
      // When: Creating service
      const service = new UploadService()
      
      // Then: Should not throw and should work
      expect(service).toBeDefined()
    })

    it('should handle missing Lambda URL gracefully', () => {
      // Given: No environment variable
      vi.stubEnv('VITE_LAMBDA_URL', '')
      
      // When: Creating service
      const service = new UploadService()
      
      // Then: Should create but warn
      expect(service).toBeDefined()
    })
  })

  describe('canUpload', () => {
    it('should return true when rate limiter allows', () => {
      // Given: Rate limiter allows upload
      vi.mocked(rateLimiter.checkLimit).mockReturnValue(true)
      
      // When: Checking if can upload
      const result = uploadService.canUpload()
      
      // Then: Should return true
      expect(result).toBe(true)
    })

    it('should return false when rate limiter blocks', () => {
      // Given: Rate limiter blocks upload
      vi.mocked(rateLimiter.checkLimit).mockReturnValue(false)
      
      // When: Checking if can upload
      const result = uploadService.canUpload()
      
      // Then: Should return false
      expect(result).toBe(false)
    })
  })

  describe('getRemainingUploads', () => {
    it('should return count from rate limiter', () => {
      // Given: Rate limiter returns 3
      vi.mocked(rateLimiter.getRemainingCount).mockReturnValue(3)
      
      // When: Getting remaining uploads
      const result = uploadService.getRemainingUploads()
      
      // Then: Should return 3
      expect(result).toBe(3)
    })
  })

  describe('blobToBase64', () => {
    it('should convert blob to base64 successfully', async () => {
      // Given: Valid blob
      
      // When: Converting blob
      const result = await (uploadService as any).blobToBase64(mockBlob)
      
      // Then: Should return base64 without prefix
      expect(result).toBe('dGVzdCBpbWFnZSBkYXRh')
    })
  })

  describe('isValidRecognitionResult', () => {
    it('should return true for valid result', () => {
      // Given: Valid recognition result
      const validResult = {
        pokemonName: 'Pikachu',
        confidenceScore: 85,
        explanation: 'Yellow mouse-like creature with red cheeks'
      }
      
      // When: Validating result
      const result = (uploadService as any).isValidRecognitionResult(validResult)
      
      // Then: Should return true
      expect(result).toBe(true)
    })

    it('should return false for missing pokemonName', () => {
      // Given: Result missing pokemonName
      const invalidResult = {
        confidenceScore: 85,
        explanation: 'Some explanation'
      }
      
      // When: Validating result
      const result = (uploadService as any).isValidRecognitionResult(invalidResult)
      
      // Then: Should return false
      expect(result).toBe(false)
    })

    it('should return false for invalid confidence score', () => {
      // Given: Result with invalid confidence score
      const invalidResult = {
        pokemonName: 'Pikachu',
        confidenceScore: 150, // > 100
        explanation: 'Some explanation'
      }
      
      // When: Validating result
      const result = (uploadService as any).isValidRecognitionResult(invalidResult)
      
      // Then: Should return false
      expect(result).toBe(false)
    })

    it('should return false for empty explanation', () => {
      // Given: Result with empty explanation
      const invalidResult = {
        pokemonName: 'Pikachu',
        confidenceScore: 85,
        explanation: ''
      }
      
      // When: Validating result
      const result = (uploadService as any).isValidRecognitionResult(invalidResult)
      
      // Then: Should return false
      expect(result).toBe(false)
    })
  })

  describe('analyzeImage', () => {
    beforeEach(() => {
      // Mock successful fetch response
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          pokemonName: 'Pikachu',
          confidenceScore: 85,
          explanation: 'Yellow electric mouse Pokémon',
          processedAt: '2024-01-01T00:00:00.000Z'
        })
      }
      mockFetch.mockResolvedValue(mockResponse)
    })

    it('should analyze image successfully', async () => {
      // Given: Valid image blob and mocked responses
      
      // When: Analyzing image
      const result = await uploadService.analyzeImage(mockBlob)
      
      // Then: Should return recognition result
      expect(result).toEqual({
        pokemonName: 'Pikachu',
        confidenceScore: 85,
        explanation: 'Yellow electric mouse Pokémon',
        processedAt: expect.any(Date)
      })
    })

    it('should throw error when Lambda URL not configured', async () => {
      // Given: No Lambda URL
      vi.stubEnv('VITE_LAMBDA_URL', '')
      const service = new UploadService()
      
      // When: Analyzing image
      // Then: Should throw error
      await expect(service.analyzeImage(mockBlob)).rejects.toThrow('Lambda URL not configured')
    })

    it('should throw error when rate limit reached', async () => {
      // Given: Rate limiter blocks upload
      vi.mocked(rateLimiter.checkLimit).mockReturnValue(false)
      vi.mocked(rateLimiter.getTimeRemainingFormatted).mockReturnValue('45 minutes')
      
      // When: Analyzing image
      // Then: Should throw rate limit error
      await expect(uploadService.analyzeImage(mockBlob)).rejects.toThrow('Upload limit reached. Please wait 45 minutes.')
    })

    it('should throw error for oversized image', async () => {
      // Given: Large image blob
      const largeBlob = new Blob(['test'], { type: 'image/png' })
      Object.defineProperty(largeBlob, 'size', { value: 2 * 1024 * 1024 }) // 2MB
      
      // When: Analyzing image
      // Then: Should throw size error
      await expect(uploadService.analyzeImage(largeBlob)).rejects.toThrow('Image size must be less than 1MB')
    })

    it('should throw error for non-image file', async () => {
      // Given: Non-image blob
      const textBlob = new Blob(['test'], { type: 'text/plain' })
      
      // When: Analyzing image
      // Then: Should throw type error
      await expect(uploadService.analyzeImage(textBlob)).rejects.toThrow('File must be an image')
    })

    it('should handle HTTP error responses', async () => {
      // Given: HTTP error response
      const errorResponse = {
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        text: vi.fn().mockResolvedValue(JSON.stringify({
          error: 'ValidationError',
          message: 'Invalid image data'
        }))
      }
      mockFetch.mockResolvedValue(errorResponse)
      
      // When: Analyzing image
      // Then: Should throw error with message
      await expect(uploadService.analyzeImage(mockBlob)).rejects.toThrow('Invalid image data')
    })

    it('should handle invalid response format', async () => {
      // Given: Invalid response format
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          // Missing required fields
          pokemonName: 'Pikachu'
        })
      }
      mockFetch.mockResolvedValue(mockResponse)
      
      // When: Analyzing image
      // Then: Should throw validation error
      await expect(uploadService.analyzeImage(mockBlob)).rejects.toThrow('Invalid response format from server')
    })

    it('should handle network errors', async () => {
      // Given: Network error
      mockFetch.mockRejectedValue(new Error('Network error'))
      
      // When: Analyzing image
      // Then: Should throw network error
      await expect(uploadService.analyzeImage(mockBlob)).rejects.toThrow('Network error')
    })
  })

  describe('analyzeImageWithRetry', () => {
    it('should succeed on first attempt', async () => {
      // Given: Successful response
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          pokemonName: 'Pikachu',
          confidenceScore: 85,
          explanation: 'Yellow electric mouse Pokémon'
        })
      }
      mockFetch.mockResolvedValue(mockResponse)
      
      // When: Analyzing with retry
      const result = await uploadService.analyzeImageWithRetry(mockBlob, 3, 100)
      
      // Then: Should succeed without retries
      expect(result.pokemonName).toBe('Pikachu')
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    it('should not retry on rate limit error', async () => {
      // Given: Rate limit error
      vi.mocked(rateLimiter.checkLimit).mockReturnValue(false)
      
      // When: Analyzing with retry
      // Then: Should throw immediately without retries
      await expect(uploadService.analyzeImageWithRetry(mockBlob, 3, 100)).rejects.toThrow('Upload limit reached')
    })

    it('should not retry on image size error', async () => {
      // Given: Oversized image
      const largeBlob = new Blob(['test'], { type: 'image/png' })
      Object.defineProperty(largeBlob, 'size', { value: 2 * 1024 * 1024 })
      
      // When: Analyzing with retry
      // Then: Should throw immediately without retries
      await expect(uploadService.analyzeImageWithRetry(largeBlob, 3, 100)).rejects.toThrow('Image size must be less than 1MB')
    })

    it('should retry on network errors', async () => {
      // Given: Network error then success
      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: vi.fn().mockResolvedValue({
            pokemonName: 'Pikachu',
            confidenceScore: 85,
            explanation: 'Yellow electric mouse Pokémon'
          })
        })
      
      // When: Analyzing with retry
      const result = await uploadService.analyzeImageWithRetry(mockBlob, 3, 10) // Short delay for test
      
      // Then: Should succeed after retry
      expect(result.pokemonName).toBe('Pikachu')
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })
  })

  describe('cancelUpload', () => {
    it('should abort ongoing request', () => {
      // Given: Upload service with abort controller
      const mockAbort = vi.fn()
      ;(uploadService as any).abortController = { abort: mockAbort }
      
      // When: Cancelling upload
      uploadService.cancelUpload()
      
      // Then: Should call abort
      expect(mockAbort).toHaveBeenCalled()
    })

    it('should handle no ongoing request gracefully', () => {
      // Given: No abort controller
      ;(uploadService as any).abortController = null
      
      // When: Cancelling upload
      // Then: Should not throw
      expect(() => uploadService.cancelUpload()).not.toThrow()
    })
  })

  describe('getUploadProgress', () => {
    it('should return current progress', () => {
      // Given: Progress set to 50
      ;(uploadService as any).uploadProgress = 50
      
      // When: Getting progress
      const result = uploadService.getUploadProgress()
      
      // Then: Should return 50
      expect(result).toBe(50)
    })
  })
})