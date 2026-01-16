<template>
  <div v-if="isVisible" class="results-overlay" @click="handleOverlayClick">
    <div class="results-container" @click.stop>
      <div class="results-header">
        <h2>AI Recognition Results</h2>
        <button class="close-button" @click="handleClose" aria-label="Close results">
          ×
        </button>
      </div>

      <div class="results-content">
        <!-- Drawing Display -->
        <div class="drawing-section">
          <h3>Your Drawing</h3>
          <div class="drawing-preview">
            <img 
              v-if="drawingImageUrl" 
              :src="drawingImageUrl" 
              alt="Your drawing"
              class="drawing-image"
            />
          </div>
        </div>

        <!-- Recognition Results -->
        <div class="recognition-section">
          <h3>AI's Guess</h3>
          
          <div v-if="result" class="pokemon-name">
            <span class="label">Pokémon:</span>
            <span class="value">{{ result.pokemonName }}</span>
          </div>

          <div v-if="result" class="confidence-score">
            <span class="label">Confidence:</span>
            <div class="confidence-bar-container">
              <div 
                class="confidence-bar" 
                :style="{ width: `${result.confidenceScore}%` }"
                :class="confidenceClass"
              ></div>
              <span class="confidence-text">{{ result.confidenceScore }}%</span>
            </div>
          </div>

          <div v-if="result" class="explanation">
            <span class="label">Explanation:</span>
            <p class="explanation-text">{{ result.explanation }}</p>
          </div>
        </div>
      </div>

      <div class="results-actions">
        <button class="draw-another-button" @click="handleDrawAnother">
          Draw Another Pokémon
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { RecognitionResult } from '@/types'

interface Props {
  isVisible: boolean
  result: RecognitionResult | null
  drawingImageUrl: string | null
}

interface Emits {
  (e: 'close'): void
  (e: 'draw-another'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const confidenceClass = computed(() => {
  if (!props.result) return ''
  
  const score = props.result.confidenceScore
  if (score >= 80) return 'high-confidence'
  if (score >= 50) return 'medium-confidence'
  return 'low-confidence'
})

const handleClose = () => {
  emit('close')
}

const handleDrawAnother = () => {
  emit('draw-another')
}

const handleOverlayClick = () => {
  emit('close')
}
</script>

<style scoped>
.results-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  backdrop-filter: blur(4px);
}

.results-container {
  background: linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%);
  border: 2px solid #6b46c1;
  border-radius: 16px;
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(107, 70, 193, 0.3);
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid rgba(107, 70, 193, 0.3);
}

.results-header h2 {
  margin: 0;
  color: #9333ea;
  font-size: 1.75rem;
  font-weight: 600;
}

.close-button {
  background: none;
  border: none;
  color: #9333ea;
  font-size: 2rem;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.close-button:hover {
  background: rgba(147, 51, 234, 0.1);
  transform: scale(1.1);
}

.results-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  padding: 2rem;
}

.drawing-section,
.recognition-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.drawing-section h3,
.recognition-section h3 {
  margin: 0;
  color: #34d399;
  font-size: 1.25rem;
  font-weight: 500;
}

.drawing-preview {
  background: #0f0f0f;
  border: 2px solid rgba(107, 70, 193, 0.3);
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.drawing-image {
  max-width: 100%;
  max-height: 400px;
  border-radius: 4px;
}

.pokemon-name,
.confidence-score,
.explanation {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.label {
  color: #10b981;
  font-weight: 500;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.value {
  color: #ffffff;
  font-size: 2rem;
  font-weight: 700;
  text-shadow: 0 0 10px rgba(147, 51, 234, 0.5);
}

.confidence-bar-container {
  position: relative;
  background: rgba(107, 70, 193, 0.2);
  border-radius: 8px;
  height: 32px;
  overflow: hidden;
}

.confidence-bar {
  height: 100%;
  transition: width 0.6s ease-out;
  border-radius: 8px;
  position: relative;
}

.confidence-bar.high-confidence {
  background: linear-gradient(90deg, #10b981 0%, #34d399 100%);
}

.confidence-bar.medium-confidence {
  background: linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%);
}

.confidence-bar.low-confidence {
  background: linear-gradient(90deg, #ef4444 0%, #f87171 100%);
}

.confidence-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #ffffff;
  font-weight: 700;
  font-size: 1rem;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  z-index: 1;
}

.explanation-text {
  color: #d1d5db;
  line-height: 1.6;
  margin: 0;
  padding: 1rem;
  background: rgba(107, 70, 193, 0.1);
  border-radius: 8px;
  border-left: 3px solid #9333ea;
}

.results-actions {
  padding: 1.5rem 2rem;
  border-top: 1px solid rgba(107, 70, 193, 0.3);
  display: flex;
  justify-content: center;
}

.draw-another-button {
  background: linear-gradient(135deg, #9333ea 0%, #6b46c1 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  font-size: 1.125rem;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(147, 51, 234, 0.3);
}

.draw-another-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(147, 51, 234, 0.4);
}

.draw-another-button:active {
  transform: translateY(0);
}

@media (max-width: 768px) {
  .results-content {
    grid-template-columns: 1fr;
  }

  .results-header h2 {
    font-size: 1.5rem;
  }

  .value {
    font-size: 1.5rem;
  }
}
</style>
