import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ResultsDisplay from './ResultsDisplay.vue'
import type { RecognitionResult } from '@/types'

describe('ResultsDisplay', () => {
  let wrapper: any
  let mockResult: RecognitionResult
  
  beforeEach(() => {
    mockResult = {
      pokemonName: 'Pikachu',
      confidenceScore: 85,
      explanation: 'This appears to be Pikachu based on the yellow coloring, pointed ears, and red cheek markings that are characteristic of this electric-type Pokémon.',
      processedAt: new Date('2024-01-01T00:00:00.000Z')
    }
  })

  describe('component visibility', () => {
    it('should not render when isVisible is false', () => {
      // Given: Component with isVisible false
      wrapper = mount(ResultsDisplay, {
        props: {
          isVisible: false,
          result: mockResult,
          drawingImageUrl: 'data:image/png;base64,test'
        }
      })
      
      // When: Checking DOM
      // Then: Should not render overlay
      expect(wrapper.find('.results-overlay').exists()).toBe(false)
    })

    it('should render when isVisible is true', () => {
      // Given: Component with isVisible true
      wrapper = mount(ResultsDisplay, {
        props: {
          isVisible: true,
          result: mockResult,
          drawingImageUrl: 'data:image/png;base64,test'
        }
      })
      
      // When: Checking DOM
      // Then: Should render overlay
      expect(wrapper.find('.results-overlay').exists()).toBe(true)
      expect(wrapper.find('.results-container').exists()).toBe(true)
    })
  })

  describe('recognition result display', () => {
    beforeEach(() => {
      wrapper = mount(ResultsDisplay, {
        props: {
          isVisible: true,
          result: mockResult,
          drawingImageUrl: 'data:image/png;base64,test'
        }
      })
    })

    it('should display Pokemon name', () => {
      // Given: Component with result
      
      // When: Checking Pokemon name display
      const pokemonName = wrapper.find('.pokemon-name .value')
      
      // Then: Should show correct name
      expect(pokemonName.exists()).toBe(true)
      expect(pokemonName.text()).toBe('Pikachu')
    })

    it('should display confidence score as percentage', () => {
      // Given: Component with result
      
      // When: Checking confidence display
      const confidenceText = wrapper.find('.confidence-text')
      
      // Then: Should show percentage
      expect(confidenceText.exists()).toBe(true)
      expect(confidenceText.text()).toBe('85%')
    })

    it('should display confidence bar with correct width', () => {
      // Given: Component with result
      
      // When: Checking confidence bar
      const confidenceBar = wrapper.find('.confidence-bar')
      
      // Then: Should have correct width style
      expect(confidenceBar.exists()).toBe(true)
      expect(confidenceBar.attributes('style')).toContain('width: 85%')
    })

    it('should display explanation text', () => {
      // Given: Component with result
      
      // When: Checking explanation
      const explanation = wrapper.find('.explanation-text')
      
      // Then: Should show explanation
      expect(explanation.exists()).toBe(true)
      expect(explanation.text()).toBe(mockResult.explanation)
    })

    it('should display drawing image when URL provided', () => {
      // Given: Component with drawing image URL
      
      // When: Checking image display
      const drawingImage = wrapper.find('.drawing-image')
      
      // Then: Should show image
      expect(drawingImage.exists()).toBe(true)
      expect(drawingImage.attributes('src')).toBe('data:image/png;base64,test')
      expect(drawingImage.attributes('alt')).toBe('Your drawing')
    })
  })

  describe('confidence score color coding', () => {
    it('should apply high-confidence class for scores >= 80', () => {
      // Given: High confidence result
      const highConfidenceResult = { ...mockResult, confidenceScore: 90 }
      wrapper = mount(ResultsDisplay, {
        props: {
          isVisible: true,
          result: highConfidenceResult,
          drawingImageUrl: null
        }
      })
      
      // When: Checking confidence bar class
      const confidenceBar = wrapper.find('.confidence-bar')
      
      // Then: Should have high-confidence class
      expect(confidenceBar.classes()).toContain('high-confidence')
    })

    it('should apply medium-confidence class for scores 50-79', () => {
      // Given: Medium confidence result
      const mediumConfidenceResult = { ...mockResult, confidenceScore: 65 }
      wrapper = mount(ResultsDisplay, {
        props: {
          isVisible: true,
          result: mediumConfidenceResult,
          drawingImageUrl: null
        }
      })
      
      // When: Checking confidence bar class
      const confidenceBar = wrapper.find('.confidence-bar')
      
      // Then: Should have medium-confidence class
      expect(confidenceBar.classes()).toContain('medium-confidence')
    })

    it('should apply low-confidence class for scores < 50', () => {
      // Given: Low confidence result
      const lowConfidenceResult = { ...mockResult, confidenceScore: 30 }
      wrapper = mount(ResultsDisplay, {
        props: {
          isVisible: true,
          result: lowConfidenceResult,
          drawingImageUrl: null
        }
      })
      
      // When: Checking confidence bar class
      const confidenceBar = wrapper.find('.confidence-bar')
      
      // Then: Should have low-confidence class
      expect(confidenceBar.classes()).toContain('low-confidence')
    })

    it('should handle edge case of exactly 80% confidence', () => {
      // Given: Exactly 80% confidence
      const edgeConfidenceResult = { ...mockResult, confidenceScore: 80 }
      wrapper = mount(ResultsDisplay, {
        props: {
          isVisible: true,
          result: edgeConfidenceResult,
          drawingImageUrl: null
        }
      })
      
      // When: Checking confidence bar class
      const confidenceBar = wrapper.find('.confidence-bar')
      
      // Then: Should have high-confidence class
      expect(confidenceBar.classes()).toContain('high-confidence')
    })

    it('should handle edge case of exactly 50% confidence', () => {
      // Given: Exactly 50% confidence
      const edgeConfidenceResult = { ...mockResult, confidenceScore: 50 }
      wrapper = mount(ResultsDisplay, {
        props: {
          isVisible: true,
          result: edgeConfidenceResult,
          drawingImageUrl: null
        }
      })
      
      // When: Checking confidence bar class
      const confidenceBar = wrapper.find('.confidence-bar')
      
      // Then: Should have medium-confidence class
      expect(confidenceBar.classes()).toContain('medium-confidence')
    })
  })

  describe('user interactions', () => {
    beforeEach(() => {
      wrapper = mount(ResultsDisplay, {
        props: {
          isVisible: true,
          result: mockResult,
          drawingImageUrl: 'data:image/png;base64,test'
        }
      })
    })

    it('should emit close event when close button clicked', async () => {
      // Given: Component with close button
      
      // When: Clicking close button
      const closeButton = wrapper.find('.close-button')
      await closeButton.trigger('click')
      
      // Then: Should emit close event
      expect(wrapper.emitted('close')).toBeTruthy()
      expect(wrapper.emitted('close')).toHaveLength(1)
    })

    it('should emit draw-another event when draw another button clicked', async () => {
      // Given: Component with draw another button
      
      // When: Clicking draw another button
      const drawAnotherButton = wrapper.find('.draw-another-button')
      await drawAnotherButton.trigger('click')
      
      // Then: Should emit draw-another event
      expect(wrapper.emitted('draw-another')).toBeTruthy()
      expect(wrapper.emitted('draw-another')).toHaveLength(1)
    })

    it('should emit close event when overlay clicked', async () => {
      // Given: Component with overlay
      
      // When: Clicking overlay
      const overlay = wrapper.find('.results-overlay')
      await overlay.trigger('click')
      
      // Then: Should emit close event
      expect(wrapper.emitted('close')).toBeTruthy()
      expect(wrapper.emitted('close')).toHaveLength(1)
    })

    it('should not emit close event when container clicked', async () => {
      // Given: Component with container
      
      // When: Clicking container (should stop propagation)
      const container = wrapper.find('.results-container')
      await container.trigger('click')
      
      // Then: Should not emit close event
      expect(wrapper.emitted('close')).toBeFalsy()
    })
  })

  describe('null/empty state handling', () => {
    it('should handle null result gracefully', () => {
      // Given: Component with null result
      wrapper = mount(ResultsDisplay, {
        props: {
          isVisible: true,
          result: null,
          drawingImageUrl: 'data:image/png;base64,test'
        }
      })
      
      // When: Checking result sections
      // Then: Should not show result-dependent elements
      expect(wrapper.find('.pokemon-name').exists()).toBe(false)
      expect(wrapper.find('.confidence-score').exists()).toBe(false)
      expect(wrapper.find('.explanation').exists()).toBe(false)
    })

    it('should handle null drawing image URL', () => {
      // Given: Component with null drawing URL
      wrapper = mount(ResultsDisplay, {
        props: {
          isVisible: true,
          result: mockResult,
          drawingImageUrl: null
        }
      })
      
      // When: Checking image display
      // Then: Should not show image
      expect(wrapper.find('.drawing-image').exists()).toBe(false)
    })

    it('should show drawing section even without image', () => {
      // Given: Component with null drawing URL
      wrapper = mount(ResultsDisplay, {
        props: {
          isVisible: true,
          result: mockResult,
          drawingImageUrl: null
        }
      })
      
      // When: Checking drawing section
      // Then: Should still show section structure
      expect(wrapper.find('.drawing-section').exists()).toBe(true)
      expect(wrapper.find('.drawing-preview').exists()).toBe(true)
    })
  })

  describe('component structure', () => {
    beforeEach(() => {
      wrapper = mount(ResultsDisplay, {
        props: {
          isVisible: true,
          result: mockResult,
          drawingImageUrl: 'data:image/png;base64,test'
        }
      })
    })

    it('should have proper header structure', () => {
      // Given: Rendered component
      
      // When: Checking header
      const header = wrapper.find('.results-header')
      const title = wrapper.find('.results-header h2')
      const closeButton = wrapper.find('.close-button')
      
      // Then: Should have correct structure
      expect(header.exists()).toBe(true)
      expect(title.exists()).toBe(true)
      expect(title.text()).toBe('AI Recognition Results')
      expect(closeButton.exists()).toBe(true)
    })

    it('should have proper content grid layout', () => {
      // Given: Rendered component
      
      // When: Checking content structure
      const content = wrapper.find('.results-content')
      const drawingSection = wrapper.find('.drawing-section')
      const recognitionSection = wrapper.find('.recognition-section')
      
      // Then: Should have grid layout
      expect(content.exists()).toBe(true)
      expect(drawingSection.exists()).toBe(true)
      expect(recognitionSection.exists()).toBe(true)
    })

    it('should have proper actions section', () => {
      // Given: Rendered component
      
      // When: Checking actions
      const actions = wrapper.find('.results-actions')
      const drawAnotherButton = wrapper.find('.draw-another-button')
      
      // Then: Should have actions section
      expect(actions.exists()).toBe(true)
      expect(drawAnotherButton.exists()).toBe(true)
      expect(drawAnotherButton.text()).toBe('Draw Another Pokémon')
    })
  })

  describe('accessibility', () => {
    beforeEach(() => {
      wrapper = mount(ResultsDisplay, {
        props: {
          isVisible: true,
          result: mockResult,
          drawingImageUrl: 'data:image/png;base64,test'
        }
      })
    })

    it('should have proper aria-label on close button', () => {
      // Given: Component with close button
      
      // When: Checking close button attributes
      const closeButton = wrapper.find('.close-button')
      
      // Then: Should have aria-label
      expect(closeButton.attributes('aria-label')).toBe('Close results')
    })

    it('should have proper alt text on drawing image', () => {
      // Given: Component with drawing image
      
      // When: Checking image attributes
      const drawingImage = wrapper.find('.drawing-image')
      
      // Then: Should have descriptive alt text
      expect(drawingImage.attributes('alt')).toBe('Your drawing')
    })
  })
})