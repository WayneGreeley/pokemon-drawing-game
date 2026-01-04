<template>
  <div class="rate-limit-display">
    <div class="rate-limit-info">
      <div class="uploads-remaining">
        <span class="label">Uploads Remaining:</span>
        <span class="count" :class="{ warning: remaining <= 2, danger: remaining === 0 }">
          {{ remaining }}/{{ maxUploads }}
        </span>
      </div>
      
      <div class="progress-bar">
        <div 
          class="progress-fill" 
          :style="{ width: `${progressPercentage}%` }"
          :class="{ warning: remaining <= 2, danger: remaining === 0 }"
        ></div>
      </div>
      
      <div v-if="remaining === 0" class="rate-limit-message">
        <p class="limit-reached">Upload limit reached!</p>
        <p class="reset-time">Resets in {{ timeRemaining }}</p>
        <button class="btn-reset" @click="$emit('reset')" title="Reset rate limit (for testing)">
          🔄 Reset Limit
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  remaining: number
  maxUploads: number
  timeRemaining: string
}

const props = defineProps<Props>()

defineEmits<{
  reset: []
}>()

const progressPercentage = computed(() => {
  return (props.remaining / props.maxUploads) * 100
})
</script>

<style scoped>
.rate-limit-display {
  margin-bottom: 1rem;
}

.rate-limit-info {
  padding: 1rem;
  background: rgba(26, 26, 26, 0.6);
  border: 1px solid #6B46C1;
  border-radius: 8px;
  backdrop-filter: blur(5px);
}

.uploads-remaining {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.label {
  font-size: 0.9rem;
  color: #E5E7EB;
  font-weight: 500;
}

.count {
  font-size: 1.1rem;
  font-weight: 700;
  color: #10B981;
  transition: color 0.3s ease;
}

.count.warning {
  color: #F59E0B;
}

.count.danger {
  color: #EF4444;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(107, 70, 193, 0.2);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.75rem;
}

.progress-fill {
  height: 100%;
  background: #10B981;
  transition: all 0.3s ease;
  border-radius: 4px;
}

.progress-fill.warning {
  background: #F59E0B;
}

.progress-fill.danger {
  background: #EF4444;
}

.rate-limit-message {
  text-align: center;
  padding-top: 0.5rem;
  border-top: 1px solid rgba(107, 70, 193, 0.3);
}

.limit-reached {
  color: #EF4444;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
  font-size: 0.95rem;
}

.reset-time {
  color: #E5E7EB;
  font-size: 0.85rem;
  margin: 0 0 0.75rem 0;
  opacity: 0.8;
}

.btn-reset {
  padding: 0.5rem 1rem;
  background: rgba(107, 70, 193, 0.2);
  border: 1px solid #6B46C1;
  border-radius: 6px;
  color: #E5E7EB;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-reset:hover {
  background: rgba(107, 70, 193, 0.4);
  box-shadow: 0 0 10px rgba(147, 51, 234, 0.3);
}
</style>