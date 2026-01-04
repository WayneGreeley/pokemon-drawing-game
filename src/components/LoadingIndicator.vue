<template>
  <div v-if="isVisible" class="loading-overlay">
    <div class="loading-content">
      <div class="spinner"></div>
      <h3 class="loading-title">{{ title }}</h3>
      <p class="loading-message">{{ message }}</p>
      
      <div v-if="showProgress" class="progress-container">
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: `${progress}%` }"
          ></div>
        </div>
        <span class="progress-text">{{ progress }}%</span>
      </div>
      
      <button 
        v-if="showCancel" 
        class="btn-cancel" 
        @click="$emit('cancel')"
      >
        Cancel
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  isVisible: boolean
  title?: string
  message?: string
  progress?: number
  showProgress?: boolean
  showCancel?: boolean
}

withDefaults(defineProps<Props>(), {
  title: 'Processing...',
  message: 'Please wait while we analyze your drawing',
  progress: 0,
  showProgress: false,
  showCancel: false
})

defineEmits<{
  cancel: []
}>()
</script>

<style scoped>
.loading-overlay {
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

.loading-content {
  text-align: center;
  padding: 2rem;
  background: rgba(26, 26, 26, 0.9);
  border: 2px solid #6B46C1;
  border-radius: 16px;
  box-shadow: 0 0 30px rgba(147, 51, 234, 0.5);
  max-width: 400px;
  width: 90%;
}

.spinner {
  width: 60px;
  height: 60px;
  border: 4px solid rgba(147, 51, 234, 0.3);
  border-top: 4px solid #9333EA;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1.5rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-title {
  color: #9333EA;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  text-shadow: 0 0 10px rgba(147, 51, 234, 0.5);
}

.loading-message {
  color: #E5E7EB;
  font-size: 1rem;
  margin: 0 0 1.5rem 0;
  opacity: 0.9;
}

.progress-container {
  margin-bottom: 1.5rem;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(107, 70, 193, 0.3);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #10B981, #9333EA);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-text {
  color: #10B981;
  font-size: 0.9rem;
  font-weight: 600;
}

.btn-cancel {
  padding: 0.75rem 1.5rem;
  background: rgba(239, 68, 68, 0.2);
  border: 2px solid #EF4444;
  border-radius: 8px;
  color: #FCA5A5;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn-cancel:hover {
  background: rgba(239, 68, 68, 0.4);
  box-shadow: 0 0 15px rgba(239, 68, 68, 0.5);
}
</style>