import type { RecognitionResult, ErrorResponse } from '@/types'
import { rateLimiter } from './RateLimiter'

export class UploadService {
  private lambdaUrl: string
  private uploadProgress = 0
  private abortController: AbortController | null = null

  constructor() {
    this.lambdaUrl = import.meta.env.VITE_LAMBDA_URL || ''
    
    if (!this.lambdaUrl) {
      console.warn('VITE_LAMBDA_URL not configured. Upload functionality will not work.')
    }
  }

  /**
   * Analyze an image using the Lambda Function URL
   */
  async analyzeImage(imageBlob: Blob): Promise<RecognitionResult> {
    if (!this.lambdaUrl) {
      throw new Error('Lambda URL not configured')
    }

    // Check rate limit
    if (!this.canUpload()) {
      throw new Error(`Upload limit reached. Please wait ${rateLimiter.getTimeRemainingFormatted()}.`)
    }

    // Validate image size (max 1MB)
    if (imageBlob.size > 1024 * 1024) {
      throw new Error('Image size must be less than 1MB')
    }

    // Validate image type
    if (!imageBlob.type.startsWith('image/')) {
      throw new Error('File must be an image')
    }

    this.abortController = new AbortController()
    this.uploadProgress = 0

    try {
      // Convert blob to base64 for Lambda Function URL
      const base64Data = await this.blobToBase64(imageBlob)
      
      this.uploadProgress = 25

      const response = await fetch(this.lambdaUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64Data,
          timestamp: new Date().toISOString()
        }),
        signal: this.abortController.signal
      })

      this.uploadProgress = 75

      if (!response.ok) {
        const errorText = await response.text()
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`
        
        try {
          const errorData = JSON.parse(errorText) as ErrorResponse
          errorMessage = errorData.message || errorMessage
        } catch {
          // Use default error message if parsing fails
        }
        
        throw new Error(errorMessage)
      }

      const result = await response.json()
      this.uploadProgress = 100

      // Validate response structure
      if (!this.isValidRecognitionResult(result)) {
        throw new Error('Invalid response format from server')
      }

      return {
        pokemonName: result.pokemonName,
        confidenceScore: result.confidenceScore,
        explanation: result.explanation,
        processedAt: new Date(result.processedAt || Date.now())
      }

    } catch (error) {
      this.uploadProgress = 0
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Upload cancelled')
        }
        throw error
      }
      
      throw new Error('Unknown error occurred during upload')
    } finally {
      this.abortController = null
    }
  }

  /**
   * Get current upload progress (0-100)
   */
  getUploadProgress(): number {
    return this.uploadProgress
  }

  /**
   * Get remaining uploads from rate limiter
   */
  getRemainingUploads(): number {
    return rateLimiter.getRemainingCount()
  }

  /**
   * Check if user can upload (rate limit check)
   */
  canUpload(): boolean {
    return rateLimiter.checkLimit()
  }

  /**
   * Cancel current upload
   */
  cancelUpload(): void {
    if (this.abortController) {
      this.abortController.abort()
    }
  }

  /**
   * Convert blob to base64 string
   */
  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        // Remove data URL prefix (data:image/png;base64,)
        const base64 = result.split(',')[1]
        resolve(base64)
      }
      reader.onerror = () => reject(new Error('Failed to convert image to base64'))
      reader.readAsDataURL(blob)
    })
  }

  /**
   * Validate recognition result structure
   */
  private isValidRecognitionResult(result: any): result is RecognitionResult {
    return (
      typeof result === 'object' &&
      result !== null &&
      typeof result.pokemonName === 'string' &&
      result.pokemonName.length > 0 &&
      typeof result.confidenceScore === 'number' &&
      result.confidenceScore >= 0 &&
      result.confidenceScore <= 100 &&
      typeof result.explanation === 'string' &&
      result.explanation.length > 0
    )
  }

  /**
   * Retry upload with exponential backoff
   */
  async analyzeImageWithRetry(
    imageBlob: Blob, 
    maxRetries: number = 3, 
    baseDelay: number = 1000
  ): Promise<RecognitionResult> {
    let lastError: Error

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await this.analyzeImage(imageBlob)
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error')
        
        // Don't retry on certain errors
        if (
          lastError.message.includes('Upload limit reached') ||
          lastError.message.includes('Image size must be less than') ||
          lastError.message.includes('File must be an image') ||
          lastError.message.includes('Lambda URL not configured')
        ) {
          throw lastError
        }

        // Don't retry on the last attempt
        if (attempt === maxRetries) {
          break
        }

        // Wait before retrying (exponential backoff)
        const delay = baseDelay * Math.pow(2, attempt)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    throw lastError!
  }
}

// Export a default instance
export const uploadService = new UploadService()