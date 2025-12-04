<template>
  <div class="drawing-canvas-container">
    <canvas
      ref="canvasRef"
      class="drawing-canvas"
      :width="canvasWidth"
      :height="canvasHeight"
      @mousedown="startDrawing"
      @mousemove="draw"
      @mouseup="stopDrawing"
      @mouseleave="stopDrawing"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="stopDrawing"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { DrawingTool } from '@/types'

// Canvas dimensions
const canvasWidth = 800
const canvasHeight = 600

// Refs
const canvasRef = ref<HTMLCanvasElement | null>(null)
const ctx = ref<CanvasRenderingContext2D | null>(null)

// Drawing state
const isDrawing = ref(false)
const currentTool = ref<DrawingTool>('brush')
const brushSize = ref(5)
const brushColor = ref('#FFFFFF')

// Initialize canvas
const initialize = () => {
  if (!canvasRef.value) return
  
  const context = canvasRef.value.getContext('2d')
  if (!context) return
  
  ctx.value = context
  
  // Set initial canvas properties
  context.lineCap = 'round'
  context.lineJoin = 'round'
  context.lineWidth = brushSize.value
  context.strokeStyle = brushColor.value
  
  // Fill canvas with white background
  context.fillStyle = '#FFFFFF'
  context.fillRect(0, 0, canvasWidth, canvasHeight)
}

// Get mouse position relative to canvas
const getMousePos = (e: MouseEvent): { x: number; y: number } => {
  if (!canvasRef.value) return { x: 0, y: 0 }
  
  const rect = canvasRef.value.getBoundingClientRect()
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  }
}

// Get touch position relative to canvas
const getTouchPos = (e: TouchEvent): { x: number; y: number } => {
  if (!canvasRef.value || !e.touches[0]) return { x: 0, y: 0 }
  
  const rect = canvasRef.value.getBoundingClientRect()
  return {
    x: e.touches[0].clientX - rect.left,
    y: e.touches[0].clientY - rect.top
  }
}

// Start drawing
const startDrawing = (e: MouseEvent) => {
  if (!ctx.value) return
  
  isDrawing.value = true
  const pos = getMousePos(e)
  
  ctx.value.beginPath()
  ctx.value.moveTo(pos.x, pos.y)
}

// Draw on canvas
const draw = (e: MouseEvent) => {
  if (!isDrawing.value || !ctx.value) return
  
  const pos = getMousePos(e)
  
  if (currentTool.value === 'eraser') {
    ctx.value.globalCompositeOperation = 'destination-out'
  } else {
    ctx.value.globalCompositeOperation = 'source-over'
  }
  
  ctx.value.lineTo(pos.x, pos.y)
  ctx.value.stroke()
}

// Stop drawing
const stopDrawing = () => {
  if (!ctx.value) return
  
  isDrawing.value = false
  ctx.value.beginPath()
}

// Handle touch start
const handleTouchStart = (e: TouchEvent) => {
  if (!ctx.value) return
  
  e.preventDefault()
  isDrawing.value = true
  const pos = getTouchPos(e)
  
  ctx.value.beginPath()
  ctx.value.moveTo(pos.x, pos.y)
}

// Handle touch move
const handleTouchMove = (e: TouchEvent) => {
  if (!isDrawing.value || !ctx.value) return
  
  e.preventDefault()
  const pos = getTouchPos(e)
  
  if (currentTool.value === 'eraser') {
    ctx.value.globalCompositeOperation = 'destination-out'
  } else {
    ctx.value.globalCompositeOperation = 'source-over'
  }
  
  ctx.value.lineTo(pos.x, pos.y)
  ctx.value.stroke()
}

// Set drawing tool
const setTool = (tool: DrawingTool) => {
  currentTool.value = tool
}

// Set brush size
const setBrushSize = (size: number) => {
  brushSize.value = size
  if (ctx.value) {
    ctx.value.lineWidth = size
  }
}

// Set brush color
const setColor = (color: string) => {
  brushColor.value = color
  if (ctx.value) {
    ctx.value.strokeStyle = color
  }
}

// Clear canvas
const clear = () => {
  if (!ctx.value || !canvasRef.value) return
  
  ctx.value.fillStyle = '#FFFFFF'
  ctx.value.fillRect(0, 0, canvasWidth, canvasHeight)
}

// Export canvas as image blob
const exportImage = async (): Promise<Blob | null> => {
  if (!canvasRef.value) return null
  
  return new Promise((resolve) => {
    canvasRef.value!.toBlob((blob) => {
      resolve(blob)
    }, 'image/png')
  })
}

// Expose methods to parent component
defineExpose({
  initialize,
  clear,
  setTool,
  setBrushSize,
  setColor,
  exportImage
})

// Initialize on mount
onMounted(() => {
  initialize()
})
</script>

<style scoped>
.drawing-canvas-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
}

.drawing-canvas {
  border: 3px solid #6B46C1;
  border-radius: 8px;
  cursor: crosshair;
  box-shadow: 0 0 30px rgba(147, 51, 234, 0.5);
  background: white;
  touch-action: none;
}

.drawing-canvas:hover {
  box-shadow: 0 0 40px rgba(147, 51, 234, 0.7);
}
</style>
