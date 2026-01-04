<template>
  <div v-if="isVisible" class="error-overlay">
    <div class="error-dialog">
      <div class="error-icon">⚠️</div>
      <h3 class="error-title">{{ title }}</h3>
      <p class="error-message">{{ message }}</p>
      
      <div v-if="details" class="error-details">
        <button 
          class="details-toggle" 
          @click="showDetails = !showDetails"
        >
          {{ showDetails ? 'Hide' : 'Show' }} Details
        </button>
        <div v-if="showDetails" class="details-content">
          {{ details }}
        </div>
      </div>
      
      <div class="error-actions">
        <button 
          v-if="showRetry" 
          class="btn btn-retry" 
          @click="$emit('retry')"
        >
          🔄 Try Again
        </button>
        <button 
          class="btn btn-close" 
          @click="$emit('close')"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  isVisible: boolean
  title?: string
  message: string
  details?: string
  showRetry?: boolean
}

withDefaults(defineProps<Props>(), {
  title: 'Upload Failed',
  showRetry: true
})

defineEmits<{
  retry: []
  close: []
}>()

const showDetails = ref(false)
</script>

<style scoped>
.error-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 15, 15, 0.9);
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.error-dialog {
  text-align: center;
  padding: 2rem;
  background: rgba(26, 26, 26, 0.9);
  border: 2px solid #EF4444;
  border-radius: 16px;
  box-shadow: 0 0 30px rgba(239, 68, 68, 0.5);
  max-width: 500px;
  width: 90%;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  filter: drop-shadow(0 0 10px rgba(239, 68, 68, 0.5));
}

.error-title {
  color: #EF4444;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  text-shadow: 0 0 10px rgba(239, 68, 68, 0.5);
}

.error-message {
  color: #E5E7EB;
  font-size: 1rem;
  margin: 0 0 1.5rem 0;
  line-height: 1.5;
}

.error-details {
  margin-bottom: 1.5rem;
  text-align: left;
}

.details-toggle {
  background: rgba(107, 70, 193, 0.2);
  border: 1px solid #6B46C1;
  border-radius: 6px;
  color: #E5E7EB;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 0.75rem;
}

.details-toggle:hover {
  background: rgba(107, 70, 193, 0.4);
}

.details-content {
  background: rgba(15, 15, 15, 0.5);
  border: 1px solid rgba(107, 70, 193, 0.3);
  border-radius: 6px;
  padding: 1rem;
  font-family: monospace;
  font-size: 0.85rem;
  color: #FCA5A5;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 200px;
  overflow-y: auto;
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: 2px solid;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn-retry {
  background: rgba(16, 185, 129, 0.2);
  border-color: #10B981;
  color: #6EE7B7;
}

.btn-retry:hover {
  background: rgba(16, 185, 129, 0.4);
  box-shadow: 0 0 15px rgba(16, 185, 129, 0.5);
}

.btn-close {
  background: rgba(107, 70, 193, 0.2);
  border-color: #6B46C1;
  color: #E5E7EB;
}

.btn-close:hover {
  background: rgba(107, 70, 193, 0.4);
  box-shadow: 0 0 15px rgba(147, 51, 234, 0.5);
}
</style>