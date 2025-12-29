<template>
  <header class="app-header">
    <div class="fog fog-1"></div>
    <div class="fog fog-2"></div>
    <div class="fog fog-3"></div>
    
    <h1 class="main-title">Pokémon Drawing Game</h1>
    <p class="subtitle">Draw a Pokémon and let AI guess what it is!</p>
    <p class="tagline">Test your artistic skills against machine learning</p>
  </header>
</template>

<script setup lang="ts">
// App header component
</script>

<style scoped>
.app-header {
  position: relative;
  text-align: center;
  padding: 3rem 2rem 2rem;
  background: linear-gradient(180deg, #0F0F0F 0%, #1A1A1A 100%);
  overflow: hidden;
}

/* Fog animation */
.fog {
  position: absolute;
  height: 100%;
  width: 200%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(107, 70, 193, 0.1) 25%,
    rgba(147, 51, 234, 0.15) 50%,
    rgba(107, 70, 193, 0.1) 75%,
    transparent 100%
  );
  opacity: 0.5;
  filter: blur(20px);
}

.fog-1 {
  top: 0;
  animation: fogMove 30s linear infinite;
}

.fog-2 {
  top: 20%;
  animation: fogMove 25s linear infinite reverse;
  animation-delay: -5s;
}

.fog-3 {
  top: 40%;
  animation: fogMove 35s linear infinite;
  animation-delay: -10s;
}

@keyframes fogMove {
  0% {
    transform: translateX(-50%);
  }
  100% {
    transform: translateX(0%);
  }
}

/* Title styling */
.main-title {
  position: relative;
  font-family: 'Creepster', cursive;
  font-size: 4rem;
  color: #9333EA;
  margin: 0 0 1rem 0;
  text-shadow: 
    0 0 20px rgba(147, 51, 234, 0.8),
    0 0 40px rgba(147, 51, 234, 0.5),
    0 0 60px rgba(147, 51, 234, 0.3);
  animation: glow 2s ease-in-out infinite alternate;
  z-index: 1;
}

@keyframes glow {
  from {
    text-shadow: 
      0 0 20px rgba(147, 51, 234, 0.8),
      0 0 40px rgba(147, 51, 234, 0.5),
      0 0 60px rgba(147, 51, 234, 0.3);
  }
  to {
    text-shadow: 
      0 0 30px rgba(147, 51, 234, 1),
      0 0 50px rgba(147, 51, 234, 0.7),
      0 0 70px rgba(147, 51, 234, 0.5);
  }
}

.subtitle {
  position: relative;
  color: #10B981;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0.5rem 0;
  z-index: 1;
  text-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
}

.tagline {
  position: relative;
  color: #E5E7EB;
  font-size: 1rem;
  font-style: italic;
  margin: 0.25rem 0 0;
  opacity: 0.8;
  z-index: 1;
}

/* Responsive design */
@media (max-width: 768px) {
  .main-title {
    font-size: 2.5rem;
  }
  
  .subtitle {
    font-size: 1.2rem;
  }
}
</style>
