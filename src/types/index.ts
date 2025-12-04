// Type definitions for the Pokémon Drawing Game

export interface RecognitionResult {
  pokemonName: string;
  confidenceScore: number;
  explanation: string;
  processedAt: Date;
}

export interface ErrorResponse {
  error: string;
  message: string;
  details?: string;
  timestamp: Date;
  retryable: boolean;
}

export type DrawingTool = 'brush' | 'eraser';

export interface RateLimitConfig {
  maxUploadsPerSession: number;
  sessionDuration: number;
}
