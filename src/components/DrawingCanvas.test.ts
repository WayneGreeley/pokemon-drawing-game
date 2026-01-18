import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import DrawingCanvas from './DrawingCanvas.vue'

// Mock canvas context
const mockContext = {
  lineCap: '',
  lineJoin: '',
  lineWidth: 0,
  strokeStyle: '',
  fillStyle: '',
  globalCompositeOperation: '',
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
  fillRect: vi.fn(),
  toBlob: vi.fn()
}

// Mock canvas element
const mockCanvas = {
  getContext: vi.fn(() => mockContext),
  getBoundingClientRect: vi.fn(() => ({
    left: 0,
    top: 0,
    width: 800,
    height: 600
  })),
  toBlob: vi.fn()
}

// Mock HTML5 Canvas
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: vi.fn(() => mockContext)
})

Object.defineProperty(HTMLCanvasElement.prototype, 'getBoundingClientRect', {
  value: vi.fn(() => ({
    left: 0,
    top: 0,
    width: 800,
    height: 600
  }))
})

Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
  value: vi.fn()
})

describe('DrawingCanvas', () => {
  let wrapper: any
  
  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks()
    
    // Mount component
    wrapper = mount(DrawingCanvas)
  })

  describe('component initialization', () => {
    it('should render canvas element', () => {
      // Given: Mounted component
      
      // When: Checking DOM
      const canvas = wrapper.find('canvas')
      
      // Then: Should have canvas element
      expect(canvas.exists()).toBe(true)
      expect(canvas.attributes('width')).toBe('800')
      expect(canvas.attributes('height')).toBe('600')
    })

    it('should initialize canvas context on mount', () => {
      // Given: Component mounted
      
      // When: Component initializes
      // Then: Should set up context properties
      expect(mockContext.lineCap).toBe('round')
      expect(mockContext.lineJoin).toBe('round')
      expect(mockContext.lineWidth).toBe(5)
      expect(mockContext.strokeStyle).toBe('#FFFFFF')
      expect(mockContext.fillStyle).toBe('#FFFFFF')
      expect(mockContext.fillRect).toHaveBeenCalledWith(0, 0, 800, 600)
    })
  })

  describe('setTool', () => {
    it('should change drawing tool to brush', () => {
      // Given: Component instance
      const component = wrapper.vm
      
      // When: Setting tool to brush
      component.setTool('brush')
      
      // Then: Should update current tool
      expect(component.currentTool).toBe('brush')
    })

    it('should change drawing tool to eraser', () => {
      // Given: Component instance
      const component = wrapper.vm
      
      // When: Setting tool to eraser
      component.setTool('eraser')
      
      // Then: Should update current tool
      expect(component.currentTool).toBe('eraser')
    })
  })

  describe('setBrushSize', () => {
    it('should update brush size and context lineWidth', () => {
      // Given: Component instance
      const component = wrapper.vm
      
      // When: Setting brush size to 10
      component.setBrushSize(10)
      
      // Then: Should update size and context
      expect(component.brushSize).toBe(10)
      expect(mockContext.lineWidth).toBe(10)
    })

    it('should handle different brush sizes', () => {
      // Given: Component instance
      const component = wrapper.vm
      
      // When: Setting various sizes
      component.setBrushSize(1)
      expect(component.brushSize).toBe(1)
      expect(mockContext.lineWidth).toBe(1)
      
      component.setBrushSize(20)
      expect(component.brushSize).toBe(20)
      expect(mockContext.lineWidth).toBe(20)
    })
  })

  describe('setColor', () => {
    it('should update brush color and context strokeStyle', () => {
      // Given: Component instance
      const component = wrapper.vm
      
      // When: Setting color to red
      component.setColor('#FF0000')
      
      // Then: Should update color and context
      expect(component.brushColor).toBe('#FF0000')
      expect(mockContext.strokeStyle).toBe('#FF0000')
    })

    it('should handle different colors', () => {
      // Given: Component instance
      const component = wrapper.vm
      
      // When: Setting various colors
      component.setColor('#00FF00')
      expect(component.brushColor).toBe('#00FF00')
      expect(mockContext.strokeStyle).toBe('#00FF00')
      
      component.setColor('#0000FF')
      expect(component.brushColor).toBe('#0000FF')
      expect(mockContext.strokeStyle).toBe('#0000FF')
    })
  })

  describe('clear', () => {
    it('should clear canvas and fill with white background', () => {
      // Given: Component instance
      const component = wrapper.vm
      
      // When: Clearing canvas
      component.clear()
      
      // Then: Should fill with white
      expect(mockContext.fillStyle).toBe('#FFFFFF')
      expect(mockContext.fillRect).toHaveBeenCalledWith(0, 0, 800, 600)
    })
  })

  describe('drawing operations', () => {
    it('should start drawing on mouse down', async () => {
      // Given: Canvas element
      const canvas = wrapper.find('canvas')
      
      // When: Mouse down event
      await canvas.trigger('mousedown', {
        clientX: 100,
        clientY: 150
      })
      
      // Then: Should begin path and move to position
      expect(mockContext.beginPath).toHaveBeenCalled()
      expect(mockContext.moveTo).toHaveBeenCalledWith(100, 150)
      expect(wrapper.vm.isDrawing).toBe(true)
    })

    it('should draw on mouse move when drawing', async () => {
      // Given: Drawing started
      const canvas = wrapper.find('canvas')
      wrapper.vm.isDrawing = true
      
      // When: Mouse move event
      await canvas.trigger('mousemove', {
        clientX: 120,
        clientY: 170
      })
      
      // Then: Should draw line
      expect(mockContext.lineTo).toHaveBeenCalledWith(120, 170)
      expect(mockContext.stroke).toHaveBeenCalled()
    })

    it('should not draw on mouse move when not drawing', async () => {
      // Given: Not drawing
      const canvas = wrapper.find('canvas')
      wrapper.vm.isDrawing = false
      
      // When: Mouse move event
      await canvas.trigger('mousemove', {
        clientX: 120,
        clientY: 170
      })
      
      // Then: Should not draw
      expect(mockContext.lineTo).not.toHaveBeenCalled()
      expect(mockContext.stroke).not.toHaveBeenCalled()
    })

    it('should stop drawing on mouse up', async () => {
      // Given: Drawing in progress
      const canvas = wrapper.find('canvas')
      wrapper.vm.isDrawing = true
      
      // When: Mouse up event
      await canvas.trigger('mouseup')
      
      // Then: Should stop drawing
      expect(wrapper.vm.isDrawing).toBe(false)
      expect(mockContext.beginPath).toHaveBeenCalled()
    })

    it('should use eraser composite operation when eraser tool selected', async () => {
      // Given: Eraser tool selected and drawing
      const canvas = wrapper.find('canvas')
      wrapper.vm.currentTool = 'eraser'
      wrapper.vm.isDrawing = true
      
      // When: Mouse move event
      await canvas.trigger('mousemove', {
        clientX: 120,
        clientY: 170
      })
      
      // Then: Should use destination-out composite operation
      expect(mockContext.globalCompositeOperation).toBe('destination-out')
    })

    it('should use source-over composite operation when brush tool selected', async () => {
      // Given: Brush tool selected and drawing
      const canvas = wrapper.find('canvas')
      wrapper.vm.currentTool = 'brush'
      wrapper.vm.isDrawing = true
      
      // When: Mouse move event
      await canvas.trigger('mousemove', {
        clientX: 120,
        clientY: 170
      })
      
      // Then: Should use source-over composite operation
      expect(mockContext.globalCompositeOperation).toBe('source-over')
    })
  })

  describe('touch events', () => {
    it('should start drawing on touch start', async () => {
      // Given: Canvas element
      const canvas = wrapper.find('canvas')
      
      // When: Touch start event
      const touchEvent = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 150 } as Touch]
      })
      
      await canvas.element.dispatchEvent(touchEvent)
      
      // Then: Should begin drawing
      expect(mockContext.beginPath).toHaveBeenCalled()
      expect(mockContext.moveTo).toHaveBeenCalledWith(100, 150)
      expect(wrapper.vm.isDrawing).toBe(true)
    })

    it('should draw on touch move', async () => {
      // Given: Touch drawing started
      const canvas = wrapper.find('canvas')
      wrapper.vm.isDrawing = true
      
      // When: Touch move event
      const touchEvent = new TouchEvent('touchmove', {
        touches: [{ clientX: 120, clientY: 170 } as Touch]
      })
      
      await canvas.element.dispatchEvent(touchEvent)
      
      // Then: Should draw line
      expect(mockContext.lineTo).toHaveBeenCalledWith(120, 170)
      expect(mockContext.stroke).toHaveBeenCalled()
    })

    it('should stop drawing on touch end', async () => {
      // Given: Touch drawing in progress
      const canvas = wrapper.find('canvas')
      wrapper.vm.isDrawing = true
      
      // When: Touch end event
      await canvas.trigger('touchend')
      
      // Then: Should stop drawing
      expect(wrapper.vm.isDrawing).toBe(false)
    })
  })

  describe('exportImage', () => {
    it('should export canvas as PNG blob', async () => {
      // Given: Component instance and mock toBlob
      const component = wrapper.vm
      const mockBlob = new Blob(['test'], { type: 'image/png' })
      
      // Mock canvas toBlob to call callback with blob
      const canvasElement = wrapper.find('canvas').element
      vi.spyOn(canvasElement, 'toBlob').mockImplementation((callback) => {
        if (callback) callback(mockBlob)
      })
      
      // When: Exporting image
      const result = await component.exportImage()
      
      // Then: Should return blob
      expect(result).toBe(mockBlob)
      expect(canvasElement.toBlob).toHaveBeenCalledWith(expect.any(Function), 'image/png')
    })
  })

  describe('mouse position calculation', () => {
    it('should calculate correct mouse position relative to canvas', () => {
      // Given: Component instance
      const component = wrapper.vm
      
      // Mock getBoundingClientRect using vi.spyOn
      const canvasElement = wrapper.find('canvas').element
      vi.spyOn(canvasElement, 'getBoundingClientRect').mockReturnValue({
        left: 50,
        top: 100,
        width: 800,
        height: 600,
        right: 850,
        bottom: 700,
        x: 50,
        y: 100,
        toJSON: () => ({})
      })
      
      // When: Getting mouse position
      const mouseEvent = { clientX: 200, clientY: 250 }
      const position = component.getMousePos(mouseEvent)
      
      // Then: Should return relative position
      expect(position).toEqual({ x: 150, y: 150 })
    })
  })

  describe('touch position calculation', () => {
    it('should calculate correct touch position relative to canvas', () => {
      // Given: Component instance
      const component = wrapper.vm
      
      // Mock getBoundingClientRect using vi.spyOn
      const canvasElement = wrapper.find('canvas').element
      vi.spyOn(canvasElement, 'getBoundingClientRect').mockReturnValue({
        left: 50,
        top: 100,
        width: 800,
        height: 600,
        right: 850,
        bottom: 700,
        x: 50,
        y: 100,
        toJSON: () => ({})
      })
      
      // When: Getting touch position
      const touchEvent = {
        touches: [{ clientX: 200, clientY: 250 }]
      }
      const position = component.getTouchPos(touchEvent)
      
      // Then: Should return relative position
      expect(position).toEqual({ x: 150, y: 150 })
    })

    it('should return default position when no touches', () => {
      // Given: Component instance
      const component = wrapper.vm
      
      // When: Getting touch position with no touches
      const touchEvent = { touches: [] }
      const position = component.getTouchPos(touchEvent)
      
      // Then: Should return default position
      expect(position).toEqual({ x: 0, y: 0 })
    })
  })
})