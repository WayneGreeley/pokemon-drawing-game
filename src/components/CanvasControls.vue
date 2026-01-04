<template>
  <div class="canvas-controls">
    <RateLimitDisplay
      v-if="remainingUploads !== undefined && maxUploads !== undefined"
      :remaining="remainingUploads"
      :max-uploads="maxUploads"
      :time-remaining="timeRemaining || ''"
      @reset="$emit('reset-rate-limit')"
    />

    <div class="control-group">
      <label class="control-label">Tool</label>
      <div class="tool-buttons">
        <button
          class="tool-btn"
          :class="{ active: currentTool === 'brush' }"
          @click="$emit('tool-change', 'brush')"
        >
          🖌️ Brush
        </button>
        <button
          class="tool-btn"
          :class="{ active: currentTool === 'eraser' }"
          @click="$emit('tool-change', 'eraser')"
        >
          ✏️ Eraser
        </button>
      </div>
    </div>

    <div class="control-group">
      <label class="control-label">Color</label>
      <div class="color-picker-container">
        <input
          type="color"
          :value="currentColor"
          @input="$emit('color-change', ($event.target as HTMLInputElement).value)"
          class="color-picker"
        />
        <span class="color-value">{{ currentColor }}</span>
      </div>
    </div>

    <div class="control-group">
      <label class="control-label">Brush Size: {{ currentSize }}px</label>
      <input
        type="range"
        min="1"
        max="50"
        :value="currentSize"
        @input="$emit('size-change', parseInt(($event.target as HTMLInputElement).value))"
        class="size-slider"
      />
    </div>

    <div class="control-group action-buttons">
      <button class="btn btn-clear" @click="$emit('clear')">
        🗑️ Clear Canvas
      </button>
      <button 
        class="btn btn-submit" 
        @click="$emit('submit')" 
        :disabled="isSubmitting || !canUpload"
        :title="!canUpload ? 'Upload limit reached' : ''"
      >
        {{ isSubmitting ? '⏳ Analyzing...' : '🎯 Submit Drawing' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DrawingTool } from '@/types'
import RateLimitDisplay from './RateLimitDisplay.vue'

interface Props {
  currentTool: DrawingTool
  currentColor: string
  currentSize: number
  isSubmitting?: boolean
  canUpload?: boolean
  remainingUploads?: number
  maxUploads?: number
  timeRemaining?: string
}

defineProps<Props>()

defineEmits<{
  'tool-change': [tool: DrawingTool]
  'color-change': [color: string]
  'size-change': [size: number]
  'clear': []
  'submit': []
  'reset-rate-limit': []
}>()
</script>

<style scoped>
.canvas-controls {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.5rem;
  background: rgba(26, 26, 26, 0.8);
  border: 2px solid #6B46C1;
  border-radius: 12px;
  backdrop-filter: blur(10px);
  min-width: 250px;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.control-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #10B981;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.tool-buttons {
  display: flex;
  gap: 0.5rem;
}

.tool-btn {
  flex: 1;
  padding: 0.75rem;
  background: rgba(107, 70, 193, 0.2);
  border: 2px solid #6B46C1;
  border-radius: 8px;
  color: #E5E7EB;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tool-btn:hover {
  background: rgba(107, 70, 193, 0.4);
  box-shadow: 0 0 15px rgba(147, 51, 234, 0.5);
}

.tool-btn.active {
  background: #6B46C1;
  box-shadow: 0 0 20px rgba(147, 51, 234, 0.7);
}

.color-picker-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.color-picker {
  width: 60px;
  height: 40px;
  border: 2px solid #6B46C1;
  border-radius: 8px;
  cursor: pointer;
  background: transparent;
}

.color-picker::-webkit-color-swatch-wrapper {
  padding: 2px;
}

.color-picker::-webkit-color-swatch {
  border: none;
  border-radius: 6px;
}

.color-value {
  font-family: monospace;
  font-size: 0.85rem;
  color: #E5E7EB;
}

.size-slider {
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: rgba(107, 70, 193, 0.3);
  outline: none;
  cursor: pointer;
}

.size-slider::-webkit-slider-thumb {
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #9333EA;
  cursor: pointer;
  box-shadow: 0 0 10px rgba(147, 51, 234, 0.7);
}

.size-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #9333EA;
  cursor: pointer;
  border: none;
  box-shadow: 0 0 10px rgba(147, 51, 234, 0.7);
}

.action-buttons {
  margin-top: 1rem;
  gap: 0.75rem;
}

.btn {
  padding: 0.875rem 1.25rem;
  border: 2px solid;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn-clear {
  background: rgba(239, 68, 68, 0.2);
  border-color: #EF4444;
  color: #FCA5A5;
}

.btn-clear:hover {
  background: rgba(239, 68, 68, 0.4);
  box-shadow: 0 0 15px rgba(239, 68, 68, 0.5);
}

.btn-submit {
  background: rgba(16, 185, 129, 0.2);
  border-color: #10B981;
  color: #6EE7B7;
}

.btn-submit:hover:not(:disabled) {
  background: rgba(16, 185, 129, 0.4);
  box-shadow: 0 0 15px rgba(16, 185, 129, 0.5);
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
