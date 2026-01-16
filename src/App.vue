<template>
  <div class="app">
    <AppHeader />
    
    <main class="main">
      <div class="canvas-section">
        <DrawingCanvas
          ref="canvasRef"
        />
      </div>
      
      <div class="controls-section">
        <CanvasControls
          :current-tool="currentTool"
          :current-color="currentColor"
          :current-size="currentSize"
          :is-submitting="isSubmitting"
          :can-upload="canUpload"
          :remaining-uploads="remainingUploads"
          :max-uploads="maxUploads"
          :time-remaining="timeRemaining"
          @tool-change="handleToolChange"
          @color-change="handleColorChange"
          @size-change="handleSizeChange"
          @clear="handleClear"
          @submit="handleSubmit"
          @reset-rate-limit="handleResetRateLimit"
        />
      </div>
    </main>
    
    <!-- Loading Indicator -->
    <LoadingIndicator
      :is-visible="showLoading"
      title="Analyzing Drawing"
      message="Our AI is examining your artwork..."
      :progress="uploadProgress"
      :show-progress="true"
      :show-cancel="true"
      @cancel="handleCancelUpload"
    />
    
    <!-- Error Dialog -->
    <ErrorDialog
      :is-visible="showError"
      :message="errorMessage"
      :details="errorDetails"
      :show-retry="true"
      @retry="handleRetryUpload"
      @close="handleCloseError"
    />
    
    <!-- Results Display -->
    <ResultsDisplay
      :is-visible="showResults"
      :result="recognitionResult"
      :drawing-image-url="drawingImageUrl"
      @close="handleCloseResults"
      @draw-another="handleDrawAnother"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import AppHeader from './components/AppHeader.vue'
import DrawingCanvas from './components/DrawingCanvas.vue'
import CanvasControls from './components/CanvasControls.vue'
import LoadingIndicator from './components/LoadingIndicator.vue'
import ErrorDialog from './components/ErrorDialog.vue'
import ResultsDisplay from './components/ResultsDisplay.vue'
import { rateLimiter } from './services/RateLimiter'
import { uploadService } from './services/UploadService'
import type { DrawingTool, RecognitionResult } from './types'

// Refs
const canvasRef = ref<InstanceType<typeof DrawingCanvas> | null>(null)

// State
const currentTool = ref<DrawingTool>('brush')
const currentColor = ref('#000000')
const currentSize = ref(5)
const isSubmitting = ref(false)

// Rate limiting state
const remainingUploads = ref(10)
const maxUploads = ref(10)
const timeRemaining = ref('')
const canUpload = computed(() => remainingUploads.value > 0)

// Upload state
const uploadProgress = ref(0)
const showLoading = ref(false)
const showError = ref(false)
const errorMessage = ref('')
const errorDetails = ref('')
const lastImageBlob = ref<Blob | null>(null)

// Results state
const recognitionResult = ref<RecognitionResult | null>(null)
const showResults = ref(false)
const drawingImageUrl = ref<string | null>(null)

// Update rate limit info
const updateRateLimitInfo = () => {
  remainingUploads.value = rateLimiter.getRemainingCount()
  timeRemaining.value = rateLimiter.getTimeRemainingFormatted()
}

// Handlers
const handleToolChange = (tool: DrawingTool) => {
  currentTool.value = tool
  canvasRef.value?.setTool(tool)
}

const handleColorChange = (color: string) => {
  currentColor.value = color
  canvasRef.value?.setColor(color)
}

const handleSizeChange = (size: number) => {
  currentSize.value = size
  canvasRef.value?.setBrushSize(size)
}

const handleClear = () => {
  canvasRef.value?.clear()
  // Reset to defaults
  currentTool.value = 'brush'
  currentColor.value = '#000000'
  currentSize.value = 5
  canvasRef.value?.setTool('brush')
  canvasRef.value?.setColor('#000000')
  canvasRef.value?.setBrushSize(5)
}

const handleSubmit = async () => {
  if (!canvasRef.value) return
  
  // Check rate limit
  if (!rateLimiter.checkLimit()) {
    showErrorDialog(
      `You've reached your upload limit. Please wait ${rateLimiter.getTimeRemainingFormatted()} before trying again.`,
      ''
    )
    return
  }
  
  isSubmitting.value = true
  showLoading.value = true
  uploadProgress.value = 0
  
  try {
    const imageBlob = await canvasRef.value.exportImage()
    if (!imageBlob) {
      throw new Error('Failed to export image from canvas')
    }
    
    lastImageBlob.value = imageBlob
    
    // Create object URL for displaying the drawing
    if (drawingImageUrl.value) {
      URL.revokeObjectURL(drawingImageUrl.value)
    }
    drawingImageUrl.value = URL.createObjectURL(imageBlob)
    
    // Start progress monitoring
    const progressInterval = setInterval(() => {
      uploadProgress.value = uploadService.getUploadProgress()
    }, 100)
    
    try {
      const result = await uploadService.analyzeImageWithRetry(imageBlob)
      
      // Increment rate limit counter on successful upload
      rateLimiter.incrementCount()
      updateRateLimitInfo()
      
      // Store result and show results display
      recognitionResult.value = result
      showLoading.value = false
      showResults.value = true
      
    } finally {
      clearInterval(progressInterval)
    }
    
  } catch (error) {
    console.error('Error submitting drawing:', error)
    
    const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred'
    
    showErrorDialog(
      errorMsg,
      error instanceof Error ? error.stack || '' : ''
    )
  } finally {
    isSubmitting.value = false
    if (!showResults.value) {
      showLoading.value = false
    }
    uploadProgress.value = 0
  }
}

const showErrorDialog = (message: string, details: string) => {
  errorMessage.value = message
  errorDetails.value = details
  showError.value = true
}

const handleRetryUpload = () => {
  showError.value = false
  if (lastImageBlob.value) {
    handleSubmitWithBlob(lastImageBlob.value)
  }
}

const handleSubmitWithBlob = async (imageBlob: Blob) => {
  isSubmitting.value = true
  showLoading.value = true
  uploadProgress.value = 0
  
  try {
    // Create object URL for displaying the drawing
    if (drawingImageUrl.value) {
      URL.revokeObjectURL(drawingImageUrl.value)
    }
    drawingImageUrl.value = URL.createObjectURL(imageBlob)
    
    const progressInterval = setInterval(() => {
      uploadProgress.value = uploadService.getUploadProgress()
    }, 100)
    
    try {
      const result = await uploadService.analyzeImageWithRetry(imageBlob)
      
      rateLimiter.incrementCount()
      updateRateLimitInfo()
      
      recognitionResult.value = result
      showLoading.value = false
      showResults.value = true
      
    } finally {
      clearInterval(progressInterval)
    }
    
  } catch (error) {
    console.error('Error submitting drawing:', error)
    
    const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred'
    
    showErrorDialog(
      errorMsg,
      error instanceof Error ? error.stack || '' : ''
    )
  } finally {
    isSubmitting.value = false
    if (!showResults.value) {
      showLoading.value = false
    }
    uploadProgress.value = 0
  }
}

const handleCancelUpload = () => {
  uploadService.cancelUpload()
  showLoading.value = false
  isSubmitting.value = false
  uploadProgress.value = 0
}

const handleCloseError = () => {
  showError.value = false
  errorMessage.value = ''
  errorDetails.value = ''
}

const handleResetRateLimit = () => {
  rateLimiter.reset()
  updateRateLimitInfo()
}

const handleCloseResults = () => {
  showResults.value = false
}

const handleDrawAnother = () => {
  showResults.value = false
  handleClear()
  
  // Clean up the drawing image URL
  if (drawingImageUrl.value) {
    URL.revokeObjectURL(drawingImageUrl.value)
    drawingImageUrl.value = null
  }
  
  recognitionResult.value = null
}

// Initialize rate limit info on mount
onMounted(() => {
  updateRateLimitInfo()
})
</script>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main {
  flex: 1;
  display: flex;
  gap: 2rem;
  padding: 2rem;
  justify-content: center;
  align-items: flex-start;
}

.canvas-section {
  flex-shrink: 0;
}

.controls-section {
  flex-shrink: 0;
}

@media (max-width: 1200px) {
  .main {
    flex-direction: column;
    align-items: center;
  }
}
</style>