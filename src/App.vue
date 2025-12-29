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
          @tool-change="handleToolChange"
          @color-change="handleColorChange"
          @size-change="handleSizeChange"
          @clear="handleClear"
          @submit="handleSubmit"
        />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AppHeader from './components/AppHeader.vue'
import DrawingCanvas from './components/DrawingCanvas.vue'
import CanvasControls from './components/CanvasControls.vue'
import type { DrawingTool } from './types'

// Refs
const canvasRef = ref<InstanceType<typeof DrawingCanvas> | null>(null)

// State
const currentTool = ref<DrawingTool>('brush')
const currentColor = ref('#000000')
const currentSize = ref(5)
const isSubmitting = ref(false)

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
  
  isSubmitting.value = true
  
  try {
    const imageBlob = await canvasRef.value.exportImage()
    if (!imageBlob) {
      console.error('Failed to export image')
      return
    }
    
    // TODO: Upload to Lambda and get AI recognition result
    console.log('Image exported:', imageBlob)
    alert('Image export successful! Upload functionality coming soon.')
  } catch (error) {
    console.error('Error submitting drawing:', error)
    alert('Failed to submit drawing. Please try again.')
  } finally {
    isSubmitting.value = false
  }
}
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
