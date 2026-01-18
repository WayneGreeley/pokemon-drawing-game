import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import fc from 'fast-check'
import ResultsDisplay from './ResultsDisplay.vue'
import type { RecognitionResult } from '@/types'

describe('ResultsDisplay Property-Based Tests', () => {
  let wrapper: any
  
  describe('Property 7: Results display shows all recognition data', () => {
    it('should display all recognition data for any valid result', () => {
      // Feature: pokemon-drawing-game, Property 7: Results display shows all recognition data
      
      // Given: Generator for valid recognition results
      const recognitionResultGen = fc.record({
        pokemonName: fc.oneof(
          fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0),
          fc.constantFrom('Pikachu', 'Charizard', 'Bulbasaur', 'Squirtle', 'Gengar', 'Alakazam')
        ),
        confidenceScore: fc.integer({ min: 0, max: 100 }),
        explanation: fc.oneof(
          fc.string({ minLength: 20, maxLength: 500 }).filter(s => s.trim().length >= 20),
          fc.constantFrom(
            'This drawing shows clear characteristics of the Pokemon.',
            'The shape and features match this Pokemon species.',
            'Based on the visual elements, this appears to be this Pokemon.'
          )
        ),
        processedAt: fc.date()
      })
      
      const drawingImageUrlGen = fc.oneof(
        fc.constant(null),
        fc.string({ minLength: 10, maxLength: 100 }).map(s => `data:image/png;base64,${s}`)
      )
      
      fc.assert(
        fc.property(
          recognitionResultGen,
          drawingImageUrlGen,
          (result, imageUrl) => {
            // Given: Component with recognition result
            wrapper = mount(ResultsDisplay, {
              props: {
                isVisible: true,
                result,
                drawingImageUrl: imageUrl
              }
            })
            
            // Then: Should display Pokemon name
            const pokemonName = wrapper.find('.pokemon-name .value')
            expect(pokemonName.exists()).toBe(true)
            expect(pokemonName.text().trim()).toBe(result.pokemonName.trim())
            
            // And: Should display confidence score
            const confidenceText = wrapper.find('.confidence-text')
            expect(confidenceText.exists()).toBe(true)
            expect(confidenceText.text()).toBe(`${result.confidenceScore}%`)
            
            // And: Should display confidence bar with correct width
            const confidenceBar = wrapper.find('.confidence-bar')
            expect(confidenceBar.exists()).toBe(true)
            expect(confidenceBar.attributes('style')).toContain(`width: ${result.confidenceScore}%`)
            
            // And: Should display explanation
            const explanation = wrapper.find('.explanation-text')
            expect(explanation.exists()).toBe(true)
            expect(explanation.text().trim()).toBe(result.explanation.trim())
            
            // And: Should display drawing image if provided
            if (imageUrl) {
              const drawingImage = wrapper.find('.drawing-image')
              expect(drawingImage.exists()).toBe(true)
              expect(drawingImage.attributes('src')).toBe(imageUrl)
            }
          }
        ),
        { numRuns: 30 }
      )
    })

    it('should apply correct confidence class for any score', () => {
      // Given: Generator for confidence scores and their expected classes
      const confidenceTestGen = fc.integer({ min: 0, max: 100 }).map(score => ({
        score,
        expectedClass: score >= 80 ? 'high-confidence' : 
                      score >= 50 ? 'medium-confidence' : 
                      'low-confidence'
      }))
      
      fc.assert(
        fc.property(confidenceTestGen, (confidenceTest) => {
          // Given: Result with specific confidence score
          const result: RecognitionResult = {
            pokemonName: 'TestPokemon',
            confidenceScore: confidenceTest.score,
            explanation: 'Test explanation for confidence testing',
            processedAt: new Date()
          }
          
          wrapper = mount(ResultsDisplay, {
            props: {
              isVisible: true,
              result,
              drawingImageUrl: null
            }
          })
          
          // Then: Should apply correct confidence class
          const confidenceBar = wrapper.find('.confidence-bar')
          expect(confidenceBar.classes()).toContain(confidenceTest.expectedClass)
        }),
        { numRuns: 50 }
      )
    })

    it('should handle edge cases in result data', () => {
      // Given: Generator for edge case scenarios
      const edgeCaseGen = fc.record({
        scenario: fc.constantFrom('short-name', 'zero-confidence', 'max-confidence', 'long-explanation'),
        pokemonName: fc.oneof(
          fc.constantFrom('A', 'Mew'), // Single character or short name
          fc.string({ minLength: 20, maxLength: 50 }).filter(s => s.trim().length > 0) // Long name
        ),
        confidenceScore: fc.constantFrom(0, 1, 50, 99, 100),
        explanation: fc.oneof(
          fc.constantFrom('Short explanation here.', 'Brief description of the Pokemon.'), // Short explanation
          fc.string({ minLength: 200, maxLength: 500 }).filter(s => s.trim().length >= 200) // Long explanation
        )
      })
      
      fc.assert(
        fc.property(edgeCaseGen, (edgeCase) => {
          // Given: Edge case result
          const result: RecognitionResult = {
            pokemonName: edgeCase.pokemonName,
            confidenceScore: edgeCase.confidenceScore,
            explanation: edgeCase.explanation,
            processedAt: new Date()
          }
          
          wrapper = mount(ResultsDisplay, {
            props: {
              isVisible: true,
              result,
              drawingImageUrl: null
            }
          })
          
          // Then: Should display all data correctly
          expect(wrapper.find('.pokemon-name .value').text()).toBe(result.pokemonName)
          expect(wrapper.find('.confidence-text').text()).toBe(`${result.confidenceScore}%`)
          expect(wrapper.find('.explanation-text').text().trim()).toBe(result.explanation.trim())
          
          // And: Should handle confidence bar width correctly
          const confidenceBar = wrapper.find('.confidence-bar')
          expect(confidenceBar.attributes('style')).toContain(`width: ${result.confidenceScore}%`)
        }),
        { numRuns: 25 }
      )
    })

    it('should emit correct events for any user interaction', () => {
      // Given: Generator for interaction scenarios
      const interactionGen = fc.record({
        action: fc.constantFrom('close-button', 'draw-another', 'overlay-click'),
        result: fc.record({
          pokemonName: fc.oneof(
            fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
            fc.constantFrom('Pikachu', 'Charizard', 'Bulbasaur')
          ),
          confidenceScore: fc.integer({ min: 0, max: 100 }),
          explanation: fc.oneof(
            fc.string({ minLength: 10, maxLength: 100 }).filter(s => s.trim().length >= 10),
            fc.constantFrom('This is a test explanation for the Pokemon identification.')
          ),
          processedAt: fc.date()
        })
      })
      
      fc.assert(
        fc.property(interactionGen, (interaction) => {
          // Given: Component with result
          wrapper = mount(ResultsDisplay, {
            props: {
              isVisible: true,
              result: interaction.result,
              drawingImageUrl: null
            }
          })
          
          // When: Performing interaction
          switch (interaction.action) {
            case 'close-button':
              wrapper.find('.close-button').trigger('click')
              expect(wrapper.emitted('close')).toBeTruthy()
              break
            case 'draw-another':
              wrapper.find('.draw-another-button').trigger('click')
              expect(wrapper.emitted('draw-another')).toBeTruthy()
              break
            case 'overlay-click':
              wrapper.find('.results-overlay').trigger('click')
              expect(wrapper.emitted('close')).toBeTruthy()
              break
          }
        }),
        { numRuns: 15 }
      )
    })

    it('should handle visibility state changes correctly', () => {
      // Given: Generator for visibility scenarios
      const visibilityGen = fc.record({
        initialVisible: fc.boolean(),
        result: fc.oneof(
          fc.constant(null),
          fc.record({
            pokemonName: fc.string({ minLength: 1, maxLength: 20 }),
            confidenceScore: fc.integer({ min: 0, max: 100 }),
            explanation: fc.string({ minLength: 10, maxLength: 100 }),
            processedAt: fc.date()
          })
        )
      })
      
      fc.assert(
        fc.property(visibilityGen, (scenario) => {
          // Given: Component with initial visibility state
          wrapper = mount(ResultsDisplay, {
            props: {
              isVisible: scenario.initialVisible,
              result: scenario.result,
              drawingImageUrl: null
            }
          })
          
          // Then: Should render based on visibility
          const overlay = wrapper.find('.results-overlay')
          expect(overlay.exists()).toBe(scenario.initialVisible)
          
          if (scenario.initialVisible && scenario.result) {
            // And: Should show result data when visible and result exists
            expect(wrapper.find('.pokemon-name').exists()).toBe(true)
            expect(wrapper.find('.confidence-score').exists()).toBe(true)
            expect(wrapper.find('.explanation').exists()).toBe(true)
          }
        }),
        { numRuns: 20 }
      )
    })
  })
})